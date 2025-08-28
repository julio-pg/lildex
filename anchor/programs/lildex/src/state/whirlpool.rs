use crate::{
    errors::ErrorCode,
    math::{
        // tick_index_from_sqrt_price, MAX_FEE_RATE, MAX_PROTOCOL_FEE_RATE,
        MAX_SQRT_PRICE_X64,
        MIN_SQRT_PRICE_X64,
    },
};
use anchor_lang::prelude::*;

use super::WhirlpoolsConfig;

#[account]
#[derive(Default)]
pub struct Whirlpool {
    pub whirlpools_config: Pubkey, // 32
    pub whirlpool_bump: [u8; 1],   // 1

    // pub tick_spacing: u16,            // 2
    // pub fee_tier_index_seed: [u8; 2], // 2

    // Stored as hundredths of a basis point
    // u16::MAX corresponds to ~6.5%
    pub fee_rate: u16, // 2

    // Portion of fee rate taken stored as basis points
    pub protocol_fee_rate: u16, // 2

    // Maximum amount that can be held by Solana account
    pub liquidity: u128, // 16

    // MAX/MIN at Q32.64, but using Q64.64 for rounder bytes
    // Q64.64
    pub sqrt_price: u128, // 16
    // pub tick_current_index: i32, // 4
    pub protocol_fee_owed_a: u64, // 8
    pub protocol_fee_owed_b: u64, // 8

    pub token_mint_a: Pubkey,  // 32
    pub token_vault_a: Pubkey, // 32

    // Q64.64
    pub fee_growth_global_a: u128, // 16

    pub token_mint_b: Pubkey,  // 32
    pub token_vault_b: Pubkey, // 32

    // Q64.64
    pub fee_growth_global_b: u128, // 16

                                   // pub reward_last_updated_timestamp: u64, // 8

                                   // pub reward_infos: [WhirlpoolRewardInfo; NUM_REWARDS], // 384
}

// Number of rewards supported by Whirlpools
pub const NUM_REWARDS: usize = 3;

impl Whirlpool {
    pub const LEN: usize = 8 + 261 + 384;
    pub fn seeds(&self) -> [&[u8]; 5] {
        [
            &b"whirlpool"[..],
            self.whirlpools_config.as_ref(),
            self.token_mint_a.as_ref(),
            self.token_mint_b.as_ref(),
            self.whirlpool_bump.as_ref(),
            // self.fee_tier_index_seed.as_ref(),
        ]
    }

    pub fn input_token_mint(&self, a_to_b: bool) -> Pubkey {
        if a_to_b {
            self.token_mint_a
        } else {
            self.token_mint_b
        }
    }

    pub fn input_token_vault(&self, a_to_b: bool) -> Pubkey {
        if a_to_b {
            self.token_vault_a
        } else {
            self.token_vault_b
        }
    }

    pub fn output_token_mint(&self, a_to_b: bool) -> Pubkey {
        if a_to_b {
            self.token_mint_b
        } else {
            self.token_mint_a
        }
    }

    pub fn output_token_vault(&self, a_to_b: bool) -> Pubkey {
        if a_to_b {
            self.token_vault_b
        } else {
            self.token_vault_a
        }
    }

    // pub fn reward_authority(&self) -> Pubkey {
    //     Pubkey::from(self.reward_infos[0].extension)
    // }

    // pub fn extension_segment_primary(&self) -> WhirlpoolExtensionSegmentPrimary {
    //     WhirlpoolExtensionSegmentPrimary::try_from_slice(&self.reward_infos[1].extension)
    //         .expect("Failed to deserialize WhirlpoolExtensionSegmentPrimary")
    // }

    // pub fn extension_segment_secondary(&self) -> WhirlpoolExtensionSegmentSecondary {
    //     WhirlpoolExtensionSegmentSecondary::try_from_slice(&self.reward_infos[2].extension)
    //         .expect("Failed to deserialize WhirlpoolExtensionSegmentSecondary")
    // }

    #[allow(clippy::too_many_arguments)]
    pub fn initialize(
        &mut self,
        whirlpools_config: &Account<WhirlpoolsConfig>,
        // fee_tier_index: u16,
        bump: u8,
        // tick_spacing: u16,
        sqrt_price: u128,
        // default_fee_rate: u16,
        token_mint_a: Pubkey,
        token_vault_a: Pubkey,
        token_mint_b: Pubkey,
        token_vault_b: Pubkey,
        // control_flags: WhirlpoolControlFlags,
    ) -> Result<()> {
        if token_mint_a.ge(&token_mint_b) {
            return Err(ErrorCode::InvalidTokenMintOrder.into());
        }

        if !(MIN_SQRT_PRICE_X64..=MAX_SQRT_PRICE_X64).contains(&sqrt_price) {
            return Err(ErrorCode::SqrtPriceOutOfBounds.into());
        }

        // if tick_spacing == 0 {
        //     // FeeTier and AdaptiveFeeTier enforce tick_spacing > 0
        //     unreachable!("tick_spacing must be greater than 0");
        // }

        self.whirlpools_config = whirlpools_config.key();
        // self.fee_tier_index_seed = fee_tier_index.to_le_bytes();
        self.whirlpool_bump = [bump];

        // self.tick_spacing = tick_spacing;

        // self.update_fee_rate(default_fee_rate)?;
        // self.update_protocol_fee_rate(whirlpools_config.default_protocol_fee_rate)?;

        self.liquidity = 0;
        self.sqrt_price = sqrt_price;
        // self.tick_current_index = tick_index_from_sqrt_price(&sqrt_price);

        self.protocol_fee_owed_a = 0;
        self.protocol_fee_owed_b = 0;

        self.token_mint_a = token_mint_a;
        self.token_vault_a = token_vault_a;
        self.fee_growth_global_a = 0;

        self.token_mint_b = token_mint_b;
        self.token_vault_b = token_vault_b;
        self.fee_growth_global_b = 0;

        // self.reward_infos[0] = WhirlpoolRewardInfo::new(
        //     whirlpools_config
        //         .reward_emissions_super_authority
        //         .to_bytes(),
        // );
        // self.reward_infos[1] = WhirlpoolRewardInfo::new(
        //     WhirlpoolExtensionSegmentPrimary::new(control_flags).to_bytes(),
        // );
        // self.reward_infos[2] =
        //     WhirlpoolRewardInfo::new(WhirlpoolExtensionSegmentSecondary::new().to_bytes());

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn update_after_swap(
        &mut self,
        liquidity: u128,
        tick_index: i32,
        sqrt_price: u128,
        fee_growth_global: u128,
        // reward_infos: [WhirlpoolRewardInfo; NUM_REWARDS],
        protocol_fee: u64,
        is_token_fee_in_a: bool,
        reward_last_updated_timestamp: u64,
    ) {
        // self.tick_current_index = tick_index;
        self.sqrt_price = sqrt_price;
        self.liquidity = liquidity;
        // self.reward_infos = reward_infos;
        // self.reward_last_updated_timestamp = reward_last_updated_timestamp;
        if is_token_fee_in_a {
            // Add fees taken via a
            self.fee_growth_global_a = fee_growth_global;
            self.protocol_fee_owed_a += protocol_fee;
        } else {
            // Add fees taken via b
            self.fee_growth_global_b = fee_growth_global;
            self.protocol_fee_owed_b += protocol_fee;
        }
    }

    // pub fn update_fee_rate(&mut self, fee_rate: u16) -> Result<()> {
    //     if fee_rate > MAX_FEE_RATE {
    //         return Err(ErrorCode::FeeRateMaxExceeded.into());
    //     }
    //     self.fee_rate = fee_rate;

    //     Ok(())
    // }

    // pub fn update_protocol_fee_rate(&mut self, protocol_fee_rate: u16) -> Result<()> {
    //     if protocol_fee_rate > MAX_PROTOCOL_FEE_RATE {
    //         return Err(ErrorCode::ProtocolFeeRateMaxExceeded.into());
    //     }
    //     self.protocol_fee_rate = protocol_fee_rate;

    //     Ok(())
    // }

    pub fn reset_protocol_fees_owed(&mut self) {
        self.protocol_fee_owed_a = 0;
        self.protocol_fee_owed_b = 0;
    }
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct WhirlpoolBumps {
    pub whirlpool_bump: u8,
}
