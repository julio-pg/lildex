use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

use crate::{errors::ErrorCode, events::*, state::*};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    pub token_authority: Signer<'info>,

    #[account(mut)]
    pub lilpool: Box<Account<'info, Lilpool>>,

    #[account(mut, constraint = token_owner_account_a.mint == lilpool.token_mint_a)]
    pub token_owner_account_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = lilpool.token_vault_a)]
    pub token_vault_a: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = token_owner_account_b.mint == lilpool.token_mint_b)]
    pub token_owner_account_b: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = lilpool.token_vault_b)]
    pub token_vault_b: Box<Account<'info, TokenAccount>>,
}

pub fn handler(ctx: Context<Swap>, amount_in: u64, min_amount_out: u64) -> Result<()> {
    let pool = &mut ctx.accounts.lilpool;

    // --- 1. Update reserves (read current state) ---
    let reserve_a = ctx.accounts.token_vault_a.amount;
    let reserve_b = ctx.accounts.token_vault_b.amount;

    // --- 2. Compute output using x*y = k ---
    let amount_in_with_fee =
        (amount_in as u128) * (10_000 - pool.protocol_fee_rate as u128) / 10_000;
    let new_reserve_a = reserve_a as u128 + amount_in_with_fee;
    let k = (reserve_a as u128) * (reserve_b as u128);
    let new_reserve_b = k / new_reserve_a;
    let amount_out = (reserve_b as u128 - new_reserve_b) as u64;

    // Check slippage
    require!(amount_out >= min_amount_out, ErrorCode::SlippageExceeded);

    // --- 3. Do transfers ---
    // User → Pool (token A in)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_owner_account_a.to_account_info(),
                to: ctx.accounts.token_vault_a.to_account_info(),
                authority: ctx.accounts.token_authority.to_account_info(),
            },
        ),
        amount_in,
    )?;

    // Pool → User (token B out)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_vault_b.to_account_info(),
                to: ctx.accounts.token_owner_account_b.to_account_info(),
                authority: pool.to_account_info(), // vault authority PDA
            },
        )
        .with_signer(&[&pool.seeds()]), // PDA signs
        amount_out,
    )?;

    Ok(())
}
