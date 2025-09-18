use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::util::*;
use crate::{errors::ErrorCode, events::Traded, state::*};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(address = *token_mint_a.to_account_info().owner)]
    pub token_program_a: Interface<'info, TokenInterface>,
    #[account(address = *token_mint_b.to_account_info().owner)]
    pub token_program_b: Interface<'info, TokenInterface>,

    pub token_authority: Signer<'info>,

    #[account(mut)]
    pub lilpool: Box<Account<'info, Lilpool>>,

    #[account(address = lilpool.token_mint_a)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    #[account(address = lilpool.token_mint_b)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(mut, constraint = token_owner_account_a.mint == lilpool.token_mint_a)]
    pub token_owner_account_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = lilpool.token_vault_a)]
    pub token_vault_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut, constraint = token_owner_account_b.mint == lilpool.token_mint_b)]
    pub token_owner_account_b: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = lilpool.token_vault_b)]
    pub token_vault_b: Box<InterfaceAccount<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Swap>, amount_in: u64, amount_out: u64, a_to_b: bool) -> Result<()> {
    perform_swap_v2(
        &ctx.accounts.lilpool,
        &ctx.accounts.token_authority,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.token_owner_account_a,
        &ctx.accounts.token_owner_account_b,
        &ctx.accounts.token_vault_a,
        &ctx.accounts.token_vault_b,
        &ctx.accounts.token_program_a,
        &ctx.accounts.token_program_b,
        amount_in,
        amount_out,
        a_to_b,
    )?;
    emit!(Traded {
        lilpool: ctx.accounts.lilpool.key(),
        token_authority: ctx.accounts.token_authority.key(),
        amount_in: amount_in,
        amount_out: amount_out,
    });
    Ok(())
}
