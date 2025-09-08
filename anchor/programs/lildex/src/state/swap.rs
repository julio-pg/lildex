use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Swap {
    pub lilpool: Pubkey,
    pub receiver: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
}
