use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::errors::ErrorCode;
use crate::state::*;
use crate::util::*;
#[derive(Accounts)]
pub struct OpenPosition<'info> {
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
    pub position: Account<'info, Position>,

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
    pub position_token_account: InterfaceAccount<'info, TokenAccount>,

    pub lilpool: Account<'info, Lilpool>,
    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      associated_token::mint = token_mint_a,
      associated_token::authority = lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      associated_token::mint = token_mint_b,
      associated_token::authority = lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = funder,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = funder,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_b: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/*
  Opens a new lilpool Position.
*/
pub fn handler(ctx: Context<OpenPosition>, token_a_amount: u64, token_b_amount: u64) -> Result<()> {
    let position_mint = &ctx.accounts.position_mint;
    let lilpool = &ctx.accounts.lilpool;

    // 🔎 Check immediately after init
    msg!(
        "Mint authority (on-chain): {:?}",
        position_mint.mint_authority
    );
    msg!("Expected lilpool key:{:?}", lilpool.key());
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

    ctx.accounts.position.set_inner(Position {
        lilpool: ctx.accounts.lilpool.key(),
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
