#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
declare_id!("6TnPz5JHzrJdj9oBFcs87zW2ewg4C5gWDPDkBzMXTfLD");

#[doc(hidden)]
pub mod auth;
#[doc(hidden)]
pub mod constants;
#[doc(hidden)]
pub mod errors;
#[doc(hidden)]
pub mod events;
#[doc(hidden)]
pub mod instructions;
#[doc(hidden)]
pub mod math;
#[doc(hidden)]
pub mod state;
#[doc(hidden)]
pub mod util;
#[doc(hidden)]
use instructions::*;

#[program]
pub mod lildex {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_authority: Pubkey,
        default_protocol_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize_config::handler(ctx, fee_authority, default_protocol_fee_rate)
    }

    pub fn initialize_pool(ctx: Context<InitializePool>, initial_price: u64) -> Result<()> {
        instructions::initialize_pool::handler(ctx, initial_price)
    }

    pub fn open_position(
        ctx: Context<OpenPosition>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        instructions::open_position::handler(ctx, token_a_amount, token_b_amount)
    }

    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        instructions::close_position::handler(ctx)
    }
    pub fn increase_liquidity(
        ctx: Context<ModifyLiquidityV2>,
        token_max_a: u64,
        token_max_b: u64,
    ) -> Result<()> {
        instructions::increase_liquidity::handler(ctx, token_max_a, token_max_b)
    }
    pub fn decrease_liquidity(
        ctx: Context<ModifyLiquidityV2>,
        token_max_a: u64,
        token_max_b: u64,
    ) -> Result<()> {
        instructions::decrease_liquidity::handler(ctx, token_max_a, token_max_b)
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64, amount_out: u64, a_to_b: bool) -> Result<()> {
        instructions::swap::handler(ctx, amount_in, amount_out, a_to_b)
    }
}
