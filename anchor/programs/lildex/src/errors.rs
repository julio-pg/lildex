use std::num::TryFromIntError;

use anchor_lang::prelude::*;

#[error_code]
#[derive(PartialEq)]
pub enum ErrorCode {
    #[msg("Position is not empty It cannot be closed")]
    ClosePositionNotEmpty, // 0x1775 (6005)

    #[msg("Unable to divide by zero")]
    DivideByZero, // 0x1776 (6006)
    #[msg("Unable to cast number into BigInt")]
    NumberCastError, //  0x1777 (6007)

    #[msg("Liquidity amount must be greater than zero")]
    LiquidityZero, // 0x177c (6012)
    #[msg("Liquidity amount must be less than i64::MAX")]
    LiquidityTooHigh, // 0x177d (6013)
    #[msg("Liquidity overflow")]
    LiquidityOverflow, // 0x177e (6014)
    #[msg("Liquidity underflow")]
    LiquidityUnderflow, // 0x177f (6015)

    #[msg("Exceeded token max")]
    TokenMaxExceeded, // 0x1781 (6017)
    #[msg("Did not meet token min")]
    TokenMinSubceeded, // 0x1782 (6018)

    #[msg("Position token account has a missing or invalid delegate")]
    MissingOrInvalidDelegate, // 0x1783 (6019)
    #[msg("Position token amount must be 1")]
    InvalidPositionTokenAmount, // 0x1784 (6020)

    #[msg("Reward vault requires amount to support emissions for at least one day")]
    RewardVaultAmountInsufficient, // 0x178b (6027)
    #[msg("Exceeded max fee rate")]
    FeeRateMaxExceeded, // 0x178c (6028)
    #[msg("Exceeded max protocol fee rate")]
    ProtocolFeeRateMaxExceeded, // 0x178d (6029)

    #[msg("Provided SqrtPriceLimit not in the same direction as the swap.")]
    InvalidSqrtPriceLimitDirection, // 0x1792 (6034)
    #[msg("There are no tradable amount to swap.")]
    ZeroTradableAmount, // 0x1793 (6035)

    #[msg("Amount out below minimum threshold")]
    AmountOutBelowMinimum, // 0x1794 (6036)
    #[msg("Amount in above maximum threshold")]
    AmountInAboveMaximum, // 0x1795 (6037)

    #[msg("Token mint has unsupported attributes")]
    UnsupportedTokenMint, // 0x179f (6047)

    #[msg("This whirlpool only supports open_position_with_token_extensions instruction")]
    PositionWithTokenExtensionsRequired, // 0x17b3 (6067)
    #[msg("Amount out slippage exceeded")]
    SlippageExceeded, // 0x17b4 (6068)
    #[msg("Insufficient token balance in funder's account")]
    InsufficientMakerBalance, // 0x17b4 (6068)
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Amount must be 50%/50%")]
    NotEqualAmount,
    #[msg("Invalid token mint - must be different from offered token")]
    InvalidTokenMint,
}

impl From<TryFromIntError> for ErrorCode {
    fn from(_: TryFromIntError) -> Self {
        ErrorCode::NumberCastError
    }
}
