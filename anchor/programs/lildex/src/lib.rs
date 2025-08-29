#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
declare_id!("6TnPz5JHzrJdj9oBFcs87zW2ewg4C5gWDPDkBzMXTfLD");

#[doc(hidden)]
pub mod auth;
#[doc(hidden)]
pub mod constants;
#[doc(hidden)]
pub mod errors;

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
        default_protocol_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize_config::handler(ctx, fee_authority, default_protocol_fee_rate)
    }

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        bumps: WhirlpoolBumps,
        // tick_spacing: u16,
        initial_sqrt_price: u128,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, bumps, initial_sqrt_price)
    }

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

    // pub fn swap(_ctx: Context<Swap>) -> Result<()> {
    //     Ok(())
    // }
}
