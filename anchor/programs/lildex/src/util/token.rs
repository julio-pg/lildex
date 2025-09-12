use crate::constants::nft::{WP_METADATA_NAME, WP_METADATA_SYMBOL, WP_METADATA_URI};
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::metadata::{self, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3};
use anchor_spl::token_2022::spl_token_2022::instruction::{
    burn_checked, close_account, mint_to, set_authority, AuthorityType,
};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

pub fn burn_and_close_user_position_token<'info>(
    token_authority: &Signer<'info>,
    receiver: &UncheckedAccount<'info>,
    position_mint: &InterfaceAccount<'info, Mint>,
    position_token_account: &InterfaceAccount<'info, TokenAccount>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    // Burn a single token in user account
    invoke_signed(
        &burn_checked(
            token_program.key,
            position_token_account.to_account_info().key,
            position_mint.to_account_info().key,
            token_authority.key,
            &[],
            1,
            position_mint.decimals,
        )?,
        &[
            token_program.to_account_info(),
            position_token_account.to_account_info(),
            position_mint.to_account_info(),
            token_authority.to_account_info(),
        ],
        &[],
    )?;

    // Close user account
    invoke_signed(
        &close_account(
            token_program.key,
            position_token_account.to_account_info().key,
            receiver.key,
            token_authority.key,
            &[],
        )?,
        &[
            token_program.to_account_info(),
            position_token_account.to_account_info(),
            receiver.to_account_info(),
            token_authority.to_account_info(),
        ],
        &[],
    )?;
    Ok(())
}

pub fn mint_position_token_and_remove_authority<'info>(
    lilpool: &Account<'info, Lilpool>,
    position_mint: &InterfaceAccount<'info, Mint>,
    position_token_account: &InterfaceAccount<'info, TokenAccount>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    // TODO: update this to the token 2022-program and turn into a nft
    mint_position_token(
        lilpool,
        position_mint,
        position_token_account,
        token_program,
    )?;
    remove_position_token_mint_authority(lilpool, position_mint, token_program)
}

#[allow(clippy::too_many_arguments)]
pub fn mint_position_token_with_metadata_and_remove_authority<'info>(
    whirlpool: &Account<'info, Lilpool>,
    position_mint: &InterfaceAccount<'info, Mint>,
    position_token_account: &InterfaceAccount<'info, TokenAccount>,
    position_metadata_account: &UncheckedAccount<'info>,
    metadata_update_auth: &UncheckedAccount<'info>,
    funder: &Signer<'info>,
    metadata_program: &Program<'info, metadata::Metadata>,
    token_program: &Interface<'info, TokenInterface>,
    system_program: &Program<'info, System>,
    rent: &Sysvar<'info, Rent>,
) -> Result<()> {
    mint_position_token(
        whirlpool,
        position_mint,
        position_token_account,
        token_program,
    )?;

    let metadata_mint_auth_account = whirlpool;
    metadata::create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: position_metadata_account.to_account_info(),
                mint: position_mint.to_account_info(),
                mint_authority: metadata_mint_auth_account.to_account_info(),
                update_authority: metadata_update_auth.to_account_info(),
                payer: funder.to_account_info(),
                rent: rent.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&metadata_mint_auth_account.seeds()],
        ),
        DataV2 {
            name: WP_METADATA_NAME.to_string(),
            symbol: WP_METADATA_SYMBOL.to_string(),
            uri: WP_METADATA_URI.to_string(),
            creators: None,
            seller_fee_basis_points: 0,
            collection: None,
            uses: None,
        },
        true,
        false,
        None,
    )?;

    remove_position_token_mint_authority(whirlpool, position_mint, token_program)
}

fn mint_position_token<'info>(
    lilpool: &Account<'info, Lilpool>,
    position_mint: &InterfaceAccount<'info, Mint>,
    position_token_account: &InterfaceAccount<'info, TokenAccount>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    invoke_signed(
        &mint_to(
            token_program.key,
            position_mint.to_account_info().key,
            position_token_account.to_account_info().key,
            lilpool.to_account_info().key,
            &[lilpool.to_account_info().key],
            1,
        )?,
        &[
            position_mint.to_account_info(),
            position_token_account.to_account_info(),
            lilpool.to_account_info(),
            token_program.to_account_info(),
        ],
        &[&lilpool.seeds()],
    )?;
    Ok(())
}

fn remove_position_token_mint_authority<'info>(
    lilpool: &Account<'info, Lilpool>,
    position_mint: &InterfaceAccount<'info, Mint>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    invoke_signed(
        &set_authority(
            token_program.key,
            position_mint.to_account_info().key,
            Option::None,
            AuthorityType::MintTokens,
            lilpool.to_account_info().key,
            &[lilpool.to_account_info().key],
        )?,
        &[
            position_mint.to_account_info(),
            lilpool.to_account_info(),
            token_program.to_account_info(),
        ],
        &[&lilpool.seeds()],
    )?;
    Ok(())
}
