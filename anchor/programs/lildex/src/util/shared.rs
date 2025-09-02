use anchor_lang::{
    prelude::{AccountInfo, Pubkey, Signer, *},
    ToAccountInfo,
};
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use solana_program::program_option::COption;
use std::convert::TryFrom;

use crate::errors::ErrorCode;

pub fn verify_position_authority<'info>(
    position_token_account: &InterfaceAccount<'info, TokenAccount>,
    position_authority: &Signer<'_>,
) -> Result<()> {
    // Check token authority using validate_owner method...
    match position_token_account.delegate {
        COption::Some(ref delegate) if position_authority.key == delegate => {
            validate_owner(delegate, &position_authority.to_account_info())?;
            if position_token_account.delegated_amount != 1 {
                return Err(ErrorCode::InvalidPositionTokenAmount.into());
            }
        }
        _ => validate_owner(
            &position_token_account.owner,
            &position_authority.to_account_info(),
        )?,
    };
    Ok(())
}
pub fn validate_owner(expected_owner: &Pubkey, owner_account_info: &AccountInfo) -> Result<()> {
    if expected_owner != owner_account_info.key || !owner_account_info.is_signer {
        return Err(ErrorCode::MissingOrInvalidDelegate.into());
    }

    Ok(())
}

pub fn to_timestamp_u64(t: i64) -> Result<u64> {
    u64::try_from(t).or(Err(ErrorCode::InvalidTimestampConversion.into()))
}

// Transfer tokens from one account to another
// If transferring from a token account owned by a PDA, owning_pda_seeds must be provided.
pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: &u64,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    owning_pda_seeds: Option<&[&[u8]]>,
) -> Result<()> {
    let transfer_accounts = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    // Only one signer seed (the PDA that owns the token account) is needed, so we create an array with the seeds
    let signers_seeds = owning_pda_seeds.map(|seeds| [seeds]);

    // Do the transfer, by calling transfer_checked - providing a different CPIU context
    // depending on whether we're sending tokens from a PDA or not
    transfer_checked(
        if let Some(seeds_arr) = signers_seeds.as_ref() {
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                transfer_accounts,
                seeds_arr,
            )
        } else {
            CpiContext::new(token_program.to_account_info(), transfer_accounts)
        },
        *amount,
        mint.decimals,
    )
}
