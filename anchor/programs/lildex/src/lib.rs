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
        initial_price: u64,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, initial_price, token_a_amount, token_b_amount)
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

    pub fn swap(ctx: Context<Swap>, amount_in: u64, amount_out: u64, a_to_b: bool) -> Result<()> {
        instructions::swap::handler(ctx, amount_in, amount_out, a_to_b)
    }
}
