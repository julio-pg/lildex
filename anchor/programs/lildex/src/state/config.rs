use crate::{errors::ErrorCode, math::MAX_PROTOCOL_FEE_RATE};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WhirlpoolsConfig {
    pub fee_authority: Pubkey,
    pub default_protocol_fee_rate: u16,
}
