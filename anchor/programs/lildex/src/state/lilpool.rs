use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Lilpool {
    pub lilpools_config: Pubkey, // 32
    // The token mint a of the pair
    pub token_mint_a: Pubkey,
    pub token_vault_a: Pubkey, // 32

    // The token mint b of the pair
    pub token_mint_b: Pubkey,
    pub token_vault_b: Pubkey, // 32

    // Portion of fee rate taken stored as basis points
    pub protocol_fee_rate: u16, // 2

    // the creator of the pool
    pub funder: Pubkey,
    // Maximum amount that can be held by Solana account
    pub liquidity: u128, // 16
    // Current price of token B in terms of token A, Q64.96 format
    pub price: u128, // 16
}

impl Lilpool {
    pub fn seeds(&self) -> [&[u8]; 4] {
        [
            &b"lilpool"[..],
            self.lilpools_config.as_ref(),
            self.token_mint_a.as_ref(),
            self.token_mint_b.as_ref(),
        ]
    }
}
