use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::errors::ErrorCode;
use crate::state::*;
use crate::util::*;

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    pub position_authority: Signer<'info>,

    /// CHECK: safe, for receiving rent only
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    #[account(mut,
        close = receiver,
        seeds = [b"position", position_mint.key().as_ref()],
        bump,
    )]
    pub position: Box<Account<'info, Position>>,
    pub lilpool: Box<Account<'info, Lilpool>>,

    #[account(mut, address = position.position_mint)]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(mut,
        constraint = position_token_account.amount == 1,
        constraint = position_token_account.mint == position.position_mint)]
    pub position_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: Box<InterfaceAccount<'info, Mint>>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(
      mut,
      associated_token::mint = token_mint_a,
      associated_token::authority = position.lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      mut,
      associated_token::mint = token_mint_b,
      associated_token::authority = position.lilpool,
      associated_token::token_program = token_program
    )]
    pub token_vault_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = position_authority,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = position_authority,
        associated_token::token_program = token_program
    )]
    pub funder_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<ClosePosition>) -> Result<()> {
    verify_position_authority(
        &ctx.accounts.position_token_account,
        &ctx.accounts.position_authority,
    )?;

    // Move the tokens from the maker's vault to the ATA
    transfer_tokens(
        &ctx.accounts.token_vault_a,
        &ctx.accounts.funder_token_account_a,
        &ctx.accounts.position.token_a_amount,
        &ctx.accounts.token_mint_a,
        &&ctx.accounts.lilpool.to_account_info(),
        &ctx.accounts.token_program,
        Some(&ctx.accounts.lilpool.seeds()),
    )
    .map_err(|_| ErrorCode::InsufficientMakerBalance)?;

    transfer_tokens(
        &ctx.accounts.token_vault_b,
        &ctx.accounts.funder_token_account_b,
        &ctx.accounts.position.token_b_amount,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.lilpool.to_account_info(),
        &ctx.accounts.token_program,
        Some(&ctx.accounts.lilpool.seeds()),
    )
    .map_err(|_| ErrorCode::InsufficientMakerBalance)?;

    burn_and_close_user_position_token(
        &ctx.accounts.position_authority,
        &ctx.accounts.receiver,
        &ctx.accounts.position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_program,
    )
}
