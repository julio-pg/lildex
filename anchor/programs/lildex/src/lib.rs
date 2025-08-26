#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod lildex {
    use super::*;

    pub fn close(_ctx: Context<CloseLildex>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.lildex.count = ctx.accounts.lildex.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.lildex.count = ctx.accounts.lildex.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeLildex>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.lildex.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeLildex<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Lildex::INIT_SPACE,
  payer = payer
    )]
    pub lildex: Account<'info, Lildex>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseLildex<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub lildex: Account<'info, Lildex>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub lildex: Account<'info, Lildex>,
}

#[account]
#[derive(InitSpace)]
pub struct Lildex {
    count: u8,
}
