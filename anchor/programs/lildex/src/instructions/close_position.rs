use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::*;
use crate::util::{burn_and_close_user_position_token, verify_position_authority};

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    pub position_authority: Signer<'info>,

    /// CHECK: safe, for receiving rent only
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    #[account(mut,
        close = receiver,
        seeds = [b"position".as_ref(), position_mint.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, Position>,

    #[account(mut, address = position.position_mint)]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(mut,
        constraint = position_token_account.amount == 1,
        constraint = position_token_account.mint == position.position_mint)]
    pub position_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<ClosePosition>) -> Result<()> {
    verify_position_authority(
        &ctx.accounts.position_token_account,
        &ctx.accounts.position_authority,
    )?;

    burn_and_close_user_position_token(
        &ctx.accounts.position_authority,
        &ctx.accounts.receiver,
        &ctx.accounts.position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_program,
    )
}
