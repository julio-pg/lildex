#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

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

use crate::state::WhirlpoolBumps;
use instructions::*;
#[program]
pub mod lildex {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_authority: Pubkey,
        collect_protocol_fees_authority: Pubkey,
        reward_emissions_super_authority: Pubkey,
        default_protocol_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize_config::handler(
            ctx,
            fee_authority,
            collect_protocol_fees_authority,
            reward_emissions_super_authority,
            default_protocol_fee_rate,
        )
    }

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        bumps: WhirlpoolBumps,
        // tick_spacing: u16,
        initial_sqrt_price: u128,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, bumps, initial_sqrt_price)
    }

    // pub fn initialize_reward(ctx: Context<InitializeReward>, reward_index: u8) -> Result<()> {
    //     instructions::initialize_reward::handler(ctx, reward_index)
    // }

    pub fn open_position(
        ctx: Context<OpenPosition>,
        bumps: state::OpenPositionBumps,
        tick_lower_index: i32,
        tick_upper_index: i32,
    ) -> Result<()> {
        instructions::open_position::handler(ctx, bumps, tick_lower_index, tick_upper_index)
    }

    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        instructions::close_position::handler(ctx)
    }
    // pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
    //     instructions::collect_fees::handler(ctx)
    // }

    // pub fn collect_reward(ctx: Context<CollectReward>, reward_index: u8) -> Result<()> {
    //     instructions::collect_reward::handler(ctx, reward_index)
    // }

    // pub fn swap(
    //     ctx: Context<Swap>,
    //     amount: u64,
    //     other_amount_threshold: u64,
    //     sqrt_price_limit: u128,
    //     amount_specified_is_input: bool,
    //     a_to_b: bool,
    // ) -> Result<()> {
    //     instructions::swap::handler(
    //         ctx,
    //         amount,
    //         other_amount_threshold,
    //         sqrt_price_limit,
    //         amount_specified_is_input,
    //         a_to_b,
    //     )
    // }
}
