use crate::state::*;
use crate::util::safe_create_account;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::{invoke, invoke_signed};

use anchor_spl::token_2022::spl_token_2022::instruction::{
    burn_checked, close_account, mint_to, set_authority, transfer_checked, AuthorityType,
};
use anchor_spl::token_2022::spl_token_2022::{self, extension::ExtensionType};
use anchor_spl::token_2022::{get_account_data_size, GetAccountDataSize};
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
    mint_position_token(
        lilpool,
        position_mint,
        position_token_account,
        token_program,
    )?;
    remove_position_token_mint_authority(lilpool, position_mint, token_program)
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

// Initializes a vault token account for a Whirlpool.
// This works for both Token and Token-2022 programs.
pub fn initialize_vault_token_account<'info>(
    lillpool: &Account<'info, Lilpool>,
    vault_token_account: &Signer<'info>,
    vault_mint: &InterfaceAccount<'info, Mint>,
    funder: &Signer<'info>,
    token_program: &Interface<'info, TokenInterface>,
    system_program: &Program<'info, System>,
) -> Result<()> {
    let is_token_2022 = token_program.key() == spl_token_2022::ID;

    // The size required for extensions that are mandatory on the TokenAccount side — based on the TokenExtensions enabled on the Mint —
    // is automatically accounted for. For non-mandatory extensions, however, they must be explicitly added,
    // so we specify ImmutableOwner explicitly.
    let space = get_account_data_size(
        CpiContext::new(
            token_program.to_account_info(),
            GetAccountDataSize {
                mint: vault_mint.to_account_info(),
            },
        ),
        // Needless to say, the program will never attempt to change the owner of the vault.
        // However, since the ImmutableOwner extension only increases the account size by 4 bytes, the overhead of always including it is negligible.
        // On the other hand, it makes it easier to comply with cases where ImmutableOwner is required, and it adds a layer of safety from a security standpoint.
        // Therefore, we'll include it by default going forward. (Vaults initialized after this change will have the ImmutableOwner extension.)
        if is_token_2022 {
            &[ExtensionType::ImmutableOwner]
        } else {
            &[]
        },
    )?;

    let lamports = Rent::get()?.minimum_balance(space as usize);

    // create account
    safe_create_account(
        system_program.to_account_info(),
        funder.to_account_info(),
        vault_token_account.to_account_info(),
        &token_program.key(),
        lamports,
        space,
        &[],
    )?;

    if is_token_2022 {
        // initialize ImmutableOwner extension
        invoke(
            &spl_token_2022::instruction::initialize_immutable_owner(
                token_program.key,
                vault_token_account.key,
            )?,
            &[
                token_program.to_account_info(),
                vault_token_account.to_account_info(),
            ],
        )?;
    }

    // initialize token account
    invoke(
        &spl_token_2022::instruction::initialize_account3(
            token_program.key,
            vault_token_account.key,
            &vault_mint.key(),
            &lillpool.key(),
        )?,
        &[
            token_program.to_account_info(),
            vault_token_account.to_account_info(),
            vault_mint.to_account_info(),
            lillpool.to_account_info(),
        ],
    )?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn transfer_from_owner_to_vault_v2<'info>(
    authority: &Signer<'info>,
    token_mint: &InterfaceAccount<'info, Mint>,
    token_owner_account: &InterfaceAccount<'info, TokenAccount>,
    token_vault: &InterfaceAccount<'info, TokenAccount>,
    token_program: &Interface<'info, TokenInterface>,
    // memo_program: &Program<'info, Memo>,
    amount: u64,
) -> Result<()> {
    let instruction = transfer_checked(
        token_program.key,
        // owner to vault
        &token_owner_account.key(), // from (owner account)
        &token_mint.key(),          // mint
        &token_vault.key(),         // to (vault account)
        authority.key,              // authority (owner)
        &[],
        amount,
        token_mint.decimals,
    )?;

    let account_infos = vec![
        // owner to vault
        token_owner_account.to_account_info(), // from (owner account)
        token_mint.to_account_info(),          // mint
        token_vault.to_account_info(),         // to (vault account)
        authority.to_account_info(),           // authority (owner)
    ];

    invoke_signed(&instruction, &account_infos, &[])?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn transfer_from_vault_to_owner_v2<'info>(
    lilpool: &Account<'info, Lilpool>,
    token_mint: &InterfaceAccount<'info, Mint>,
    token_vault: &InterfaceAccount<'info, TokenAccount>,
    token_owner_account: &InterfaceAccount<'info, TokenAccount>,
    token_program: &Interface<'info, TokenInterface>,
    amount: u64,
) -> Result<()> {
    let instruction = transfer_checked(
        token_program.key,
        // vault to owner
        &token_vault.key(),         // from (vault account)
        &token_mint.key(),          // mint
        &token_owner_account.key(), // to (owner account)
        &lilpool.key(),             // authority (pool)
        &[],
        amount,
        token_mint.decimals,
    )?;

    let account_infos = vec![
        // vault to owner
        token_vault.to_account_info(),         // from (vault account)
        token_mint.to_account_info(),          // mint
        token_owner_account.to_account_info(), // to (owner account)
        lilpool.to_account_info(),             // authority (pool)
    ];

    invoke_signed(&instruction, &account_infos, &[&lilpool.seeds()])?;

    Ok(())
}
