use anchor_lang::prelude::*;

#[event]
pub struct Traded {
    pub lilpool: Pubkey,
    pub receiver: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
}
