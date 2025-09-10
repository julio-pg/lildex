use crate::state::*;
use crate::util::*;
use crate::{errors::ErrorCode, math::MAX_PROTOCOL_LIQUIDITY};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    pub lilpools_config: Box<Account<'info, LilpoolsConfig>>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub funder: Signer<'info>,

    /// CHECK: safe, the account that will be the owner of the position can be arbitrary
    pub owner: UncheckedAccount<'info>,

    #[account(
      init,
      payer = funder,
      space = Lilpool::DISCRIMINATOR.len() + Position::INIT_SPACE,
      seeds = [b"position", position_mint.key().as_ref()],
      bump,
    )]
    pub position: Box<Account<'info, Position>>,

    #[account(
      init,
      payer=funder,
      mint::decimals = 0,
      mint::authority= lilpool,
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(
      init,
      payer = funder,
      associated_token::mint = position_mint,
      associated_token::authority = owner,
    )]
    pub position_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init,
      payer = funder,
      seeds = [
        b"lilpool",
        lilpools_config.key().as_ref(),
        token_mint_a.key().as_ref(),
        token_mint_b.key().as_ref(),
      ],
      space = Lilpool::DISCRIMINATOR.len() + Lilpool::INIT_SPACE,
      bump,
    )]
    pub lilpool: Box<Account<'info, Lilpool>>,
    #[account(
      init,
      payer = funder,
      associated_token::mint = token_mint_a,
      associated_token::authority = lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init,
      payer = funder,
      associated_token::mint = token_mint_b,
      associated_token::authority = lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = funder,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = funder,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_b: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializePool>,
    initial_price: u64,
    token_a_amount: u64,
    token_b_amount: u64,
) -> Result<()> {
    // Validate amounts
    require!(token_a_amount > 0, ErrorCode::InvalidAmount);
    require!(token_b_amount > 0, ErrorCode::InvalidAmount);
    // TODO: fix that comprobation
    // require!(
    //     token_a_amount * initial_price == token_b_amount,
    //     ErrorCode::NotEqualAmount
    // );

    // Validate token mints are different
    require!(
        ctx.accounts.token_mint_a.key() != ctx.accounts.token_mint_b.key(),
        ErrorCode::InvalidTokenMint,
    );

    // TODO: this should open a position too
    // Move the tokens from the maker's ATA to the vault
    transfer_tokens(
        &ctx.accounts.funder_token_account_a,
        &ctx.accounts.token_vault_a,
        &token_a_amount,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.funder.to_account_info(),
        &ctx.accounts.token_program,
        None,
    )
    .map_err(|_| ErrorCode::InsufficientMakerBalance)?;

    transfer_tokens(
        &ctx.accounts.funder_token_account_b,
        &ctx.accounts.token_vault_b,
        &token_b_amount,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.funder.to_account_info(),
        &ctx.accounts.token_program,
        None,
    )
    .map_err(|_| ErrorCode::InsufficientMakerBalance)?;

    let bump = ctx.bumps.lilpool;

    ctx.accounts.lilpool.set_inner(Lilpool {
        lilpools_config: ctx.accounts.lilpools_config.key(),
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_vault_a: ctx.accounts.token_vault_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(),
        token_vault_b: ctx.accounts.token_vault_b.key(),
        protocol_fee_rate: ctx.accounts.lilpools_config.default_protocol_fee_rate,
        funder: ctx.accounts.funder.key(),
        liquidity: MAX_PROTOCOL_LIQUIDITY,
        price: initial_price,
        lilpool_bump: [bump],
    });

    ctx.accounts.position.set_inner(Position {
        lilpool: ctx.accounts.lilpool.key(),
        funder: ctx.accounts.funder.key(),
        position_mint: ctx.accounts.position_mint.key(),
        token_a_amount: token_a_amount,
        token_b_amount: token_b_amount,
    });
    mint_position_token_and_remove_authority(
        &ctx.accounts.lilpool,
        &ctx.accounts.position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_program,
    )
}
