use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::util::*;
use crate::{errors::ErrorCode, events::Traded, state::*};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub receiver: Signer<'info>,

    #[account(mut)]
    pub lilpool: Box<Account<'info, Lilpool>>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = receiver,
        associated_token::token_program = token_program)]
    pub token_receiver_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed, 
        payer = receiver,
        associated_token::mint = token_mint_b,
        associated_token::authority = receiver,
        associated_token::token_program = token_program)]
    pub token_receiver_account_b: Box<InterfaceAccount<'info, TokenAccount>>,
    
    #[account(mut, address = lilpool.token_vault_a)]
    pub token_vault_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = lilpool.token_vault_b)]
    pub token_vault_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: Box<InterfaceAccount<'info, Mint>>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: Box<InterfaceAccount<'info, Mint>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Swap>, amount_in: u64, amount_out: u64, a_to_b: bool) -> Result<()> {
    if a_to_b {
        transfer_tokens(
            &ctx.accounts.token_receiver_account_a,
            &ctx.accounts.token_vault_a,
            &amount_in,
            &ctx.accounts.token_mint_a,
            &ctx.accounts.receiver.to_account_info(),
            &ctx.accounts.token_program,
            None,
        )
        .map_err(|_| ErrorCode::InsufficientMakerBalance)?;
        transfer_tokens(
            &ctx.accounts.token_vault_b,
            &ctx.accounts.token_receiver_account_b,
            &amount_out,
            &ctx.accounts.token_mint_b,
            &ctx.accounts.lilpool.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.lilpool.seeds()),
        )
        .map_err(|_| ErrorCode::InsufficientMakerBalance)?;
    } else {
        transfer_tokens(
            &ctx.accounts.token_receiver_account_b,
            &ctx.accounts.token_vault_b,
            &amount_in,
            &ctx.accounts.token_mint_b,
            &ctx.accounts.receiver.to_account_info(),
            &ctx.accounts.token_program,
            None,
        )
        .map_err(|_| ErrorCode::InsufficientMakerBalance)?;
        transfer_tokens(
            &ctx.accounts.token_vault_a,
            &ctx.accounts.token_receiver_account_a,
            &amount_out,
            &ctx.accounts.token_mint_a,
            &ctx.accounts.lilpool.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.lilpool.seeds()),
        )
        .map_err(|_| ErrorCode::InsufficientMakerBalance)?;
    }

    emit!(Traded {
        lilpool: ctx.accounts.lilpool.key(),
        receiver: ctx.accounts.receiver.key(),
        amount_in: amount_in,
        amount_out: amount_out,
    });
    Ok(())
}
