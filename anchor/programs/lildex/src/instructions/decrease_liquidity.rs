use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::events::*;
use crate::util::transfer_from_vault_to_owner_v2;

use super::increase_liquidity::ModifyLiquidityV2;

/*
  Removes liquidity from an existing Whirlpool Position.
*/
pub fn handler<'info>(
    ctx: Context<ModifyLiquidityV2>,
    // liquidity_amount: u128,
    token_min_a: u64,
    token_min_b: u64,
) -> Result<()> {
    // Validate amounts
    require!(token_min_a > 0, ErrorCode::InvalidAmount);
    require!(token_min_b > 0, ErrorCode::InvalidAmount);

    // Validate token mints are different
    require!(
        ctx.accounts.token_mint_a.key() != ctx.accounts.token_mint_b.key(),
        ErrorCode::InvalidTokenMint
    );

    transfer_from_vault_to_owner_v2(
        &ctx.accounts.lilpool,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.token_vault_a,
        &ctx.accounts.token_owner_account_a,
        &ctx.accounts.token_program_a,
        token_min_a,
    )?;

    transfer_from_vault_to_owner_v2(
        &ctx.accounts.lilpool,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.token_vault_b,
        &ctx.accounts.token_owner_account_b,
        &ctx.accounts.token_program_b,
        token_min_b,
    )?;
    let position = &mut ctx.accounts.position;
    position.token_a_amount = position.token_a_amount.checked_sub(token_min_a).unwrap();
    position.token_b_amount = position.token_b_amount.checked_sub(token_min_b).unwrap();

    emit!(LiquidityDecreased {
        lilpool: ctx.accounts.lilpool.key(),
        position: ctx.accounts.position.key(),
        token_a_amount: token_min_a,
        token_b_amount: token_min_a,
    });

    Ok(())
}
