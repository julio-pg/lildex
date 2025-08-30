use crate::state::*;
use crate::{errors::ErrorCode, math::MAX_PROTOCOL_LIQUIDITY};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    pub lilpools_config: Box<Account<'info, LilpoolsConfig>>,
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(init,
      seeds = [
        b"lilpool".as_ref(),
        lilpools_config.key().as_ref(),
        token_mint_a.key().as_ref(),
        token_mint_b.key().as_ref(),
      ],
      bump,
      payer = funder,
      space = Lilpool::INIT_SPACE)]
    pub lilpool: Box<Account<'info, Lilpool>>,
    #[account(
      init,
        payer = funder,
        associated_token::mint = token_mint_a,
        associated_token::authority = lilpool,
        associated_token::token_program = token_program
    )]
    pub token_vault_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
      init,
        payer = funder,
        associated_token::mint = token_mint_b,
        associated_token::authority = lilpool,
        associated_token::token_program = token_program
    )]
    pub token_vault_b: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePool>, initial_price: u128) -> Result<()> {
    let token_mint_a = ctx.accounts.token_mint_a.key();
    let token_vault_a = ctx.accounts.token_vault_a.key();
    let token_mint_b = ctx.accounts.token_mint_b.key();
    let token_vault_b = ctx.accounts.token_vault_b.key();

    require!(
        token_mint_a != token_mint_b,
        ErrorCode::InvalidTokenMintOrder,
    );

    ctx.accounts.lilpool.set_inner(Lilpool {
        lilpools_config: ctx.accounts.lilpools_config.key(),
        token_mint_a: token_mint_a,
        token_vault_a: token_vault_a,
        token_mint_b: token_mint_b,
        token_vault_b: token_vault_b,
        protocol_fee_rate: ctx.accounts.lilpools_config.default_protocol_fee_rate,
        funder: ctx.accounts.funder.key(),
        liquidity: MAX_PROTOCOL_LIQUIDITY,
        price: initial_price,
    });
    Ok(())
}
