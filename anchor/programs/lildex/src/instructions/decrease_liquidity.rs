use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::events::*;
use crate::util::transfer_from_vault_to_owner_v2;

use super::increase_liquidity::ModifyLiquidityV2;

/*
  Removes liquidity from an existing Whirlpool Position.
*/
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, ModifyLiquidityV2<'info>>,
    liquidity_amount: u128,
    token_min_a: u64,
    token_min_b: u64,
) -> Result<()> {
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

    emit!(LiquidityDecreased {
        lilpool: ctx.accounts.lilpool.key(),
        position: ctx.accounts.position.key(),
        token_a_amount: token_min_a,
        token_b_amount: token_min_a,
    });

    Ok(())
}
