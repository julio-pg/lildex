use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::state::*;
use crate::util::*;

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,

    /// CHECK: safe, the account that will be the owner of the position can be arbitrary
    pub owner: UncheckedAccount<'info>,

    #[account(init,
      payer = funder,
      space = Position::INIT_SPACE,
      seeds = [b"position".as_ref(), position_mint.key().as_ref()],
      bump,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mint::token_program = token_program
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(init,
      payer = funder,
      associated_token::mint = position_mint,
      associated_token::authority = owner,
    )]
    pub position_token_account: InterfaceAccount<'info, TokenAccount>,

    pub lilpool: Account<'info, Lilpool>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/*
  Opens a new Whirlpool Position.
*/
pub fn handler(ctx: Context<OpenPosition>) -> Result<()> {
    let lilpool = &ctx.accounts.lilpool;
    let position_mint = &ctx.accounts.position_mint;
    ctx.accounts.position.set_inner(Position {
        lilpool: ctx.accounts.lilpool.key(),
        position_mint: ctx.accounts.position_mint.key(),
    });

    mint_position_token_and_remove_authority(
        &lilpool,
        position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_program,
    )
}
