use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::events::*;

use crate::state::*;
use crate::util::transfer_from_owner_to_vault_v2;

#[derive(Accounts)]
pub struct ModifyLiquidityV2<'info> {
    #[account(mut)]
    pub lilpool: Account<'info, Lilpool>,

    #[account(address = *token_mint_a.to_account_info().owner)]
    pub token_program_a: Interface<'info, TokenInterface>,
    #[account(address = *token_mint_b.to_account_info().owner)]
    pub token_program_b: Interface<'info, TokenInterface>,

    // pub memo_program: Program<'info, Memo>,
    pub position_authority: Signer<'info>,

    #[account(mut, has_one = lilpool)]
    pub position: Account<'info, Position>,
    #[account(
        constraint = position_token_account.mint == position.position_mint,
        constraint = position_token_account.amount == 1
    )]
    pub position_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(address = lilpool.token_mint_a)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    #[account(address = lilpool.token_mint_b)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(mut, constraint = token_owner_account_a.mint == lilpool.token_mint_a)]
    pub token_owner_account_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, constraint = token_owner_account_b.mint == lilpool.token_mint_b)]
    pub token_owner_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut, constraint = token_vault_a.key() == lilpool.token_vault_a)]
    pub token_vault_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, constraint = token_vault_b.key() == lilpool.token_vault_b)]
    pub token_vault_b: Box<InterfaceAccount<'info, TokenAccount>>,
}

pub fn handler<'info>(
    ctx: Context<ModifyLiquidityV2>,
    // liquidity_amount: u128,
    token_max_a: u64,
    token_max_b: u64,
    // remaining_accounts_info: Option<RemainingAccountsInfo>,
) -> Result<()> {
    // verify_position_authority_interface(
    //     &ctx.accounts.position_token_account,
    //     &ctx.accounts.position_authority,
    // )?;

    transfer_from_owner_to_vault_v2(
        &ctx.accounts.position_authority,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.token_owner_account_a,
        &ctx.accounts.token_vault_a,
        &ctx.accounts.token_program_a,
        token_max_a,
    )?;

    transfer_from_owner_to_vault_v2(
        &ctx.accounts.position_authority,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.token_owner_account_b,
        &ctx.accounts.token_vault_b,
        &ctx.accounts.token_program_b,
        token_max_b,
    )?;

    emit!(LiquidityIncreased {
        lilpool: ctx.accounts.lilpool.key(),
        position: ctx.accounts.position.key(),
        // liquidity: liquidity_amount,
        token_a_amount: token_max_a,
        token_b_amount: token_max_b
    });

    Ok(())
}
