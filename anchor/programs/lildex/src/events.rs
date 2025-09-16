use anchor_lang::prelude::*;

#[event]
pub struct Traded {
    pub lilpool: Pubkey,
    pub receiver: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
}
#[event]
pub struct PoolInitialized {
    pub lilpools_config: Pubkey,
    pub lilpool: Pubkey,
    // The token mint a of the pair
    pub token_mint_a: Pubkey,
    // The token mint b of the pair
    pub token_mint_b: Pubkey,
    pub token_program_a: Pubkey,
    pub token_program_b: Pubkey,
    pub decimals_a: u8,
    pub decimals_b: u8,
    // Current price of token B in terms of token A,
    pub initial_price: u64,
}

#[event]
pub struct LiquidityIncreased {
    pub lilpool: Pubkey,
    pub position: Pubkey,
    // pub liquidity: u128,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}

#[event]
pub struct LiquidityDecreased {
    pub lilpool: Pubkey,
    pub position: Pubkey,
    // pub liquidity: u128,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}
