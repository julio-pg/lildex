use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub lilpool: Pubkey,
    pub funder: Pubkey,
    pub position_mint: Pubkey,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
    // pub liquidity: u64,
}
