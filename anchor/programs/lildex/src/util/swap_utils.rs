use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::{
    state::Lilpool,
    util::{transfer_from_owner_to_vault_v2, transfer_from_vault_to_owner_v2},
};

#[allow(clippy::too_many_arguments)]
pub fn perform_swap_v2<'info>(
    lilpool: &Account<'info, Lilpool>,
    token_authority: &Signer<'info>,
    token_mint_a: &InterfaceAccount<'info, Mint>,
    token_mint_b: &InterfaceAccount<'info, Mint>,
    token_owner_account_a: &InterfaceAccount<'info, TokenAccount>,
    token_owner_account_b: &InterfaceAccount<'info, TokenAccount>,
    token_vault_a: &InterfaceAccount<'info, TokenAccount>,
    token_vault_b: &InterfaceAccount<'info, TokenAccount>,
    token_program_a: &Interface<'info, TokenInterface>,
    token_program_b: &Interface<'info, TokenInterface>,
    amount_a: u64,
    amount_b: u64,
    a_to_b: bool,
) -> Result<()> {
    // Transfer from user to pool
    let deposit_token_program;
    let deposit_mint;
    let deposit_account_user;
    let deposit_account_pool;
    let deposit_amount;

    // Transfer from pool to user
    let withdrawal_token_program;
    let withdrawal_mint;
    let withdrawal_account_user;
    let withdrawal_account_pool;
    let withdrawal_amount;

    if a_to_b {
        deposit_token_program = token_program_a;
        deposit_mint = token_mint_a;
        deposit_account_user = token_owner_account_a;
        deposit_account_pool = token_vault_a;
        deposit_amount = amount_a;

        withdrawal_token_program = token_program_b;
        withdrawal_mint = token_mint_b;
        withdrawal_account_user = token_owner_account_b;
        withdrawal_account_pool = token_vault_b;
        withdrawal_amount = amount_b;
    } else {
        deposit_token_program = token_program_b;
        deposit_mint = token_mint_b;
        deposit_account_user = token_owner_account_b;
        deposit_account_pool = token_vault_b;
        deposit_amount = amount_b;

        withdrawal_token_program = token_program_a;
        withdrawal_mint = token_mint_a;
        withdrawal_account_user = token_owner_account_a;
        withdrawal_account_pool = token_vault_a;
        withdrawal_amount = amount_a;
    }

    transfer_from_owner_to_vault_v2(
        token_authority,
        deposit_mint,
        deposit_account_user,
        deposit_account_pool,
        deposit_token_program,
        deposit_amount,
    )?;

    transfer_from_vault_to_owner_v2(
        lilpool,
        withdrawal_mint,
        withdrawal_account_pool,
        withdrawal_account_user,
        withdrawal_token_program,
        withdrawal_amount,
    )?;

    Ok(())
}
