use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::spl_token_2022::{self, extension::ExtensionType},
    token_interface::{Mint, TokenAccount, TokenInterface},
};
// use spl_token::ID as TOKEN_PROGRAM_ID;
// use spl_token_2022::ID as TOKEN_2022_PROGRAM_ID;
use crate::errors::ErrorCode;
use crate::state::*;
use crate::util::*;
#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,

    /// CHECK: safe, the account that will be the owner of the position can be arbitrary
    pub owner: UncheckedAccount<'info>,

    #[account(
      init,
      payer = funder,
      space = Lilpool::DISCRIMINATOR.len() + Position::INIT_SPACE,
      seeds = [b"position", position_mint.key().as_ref()],
      bump,
    )]
    pub position: Box<Account<'info, Position>>,

    #[account(
      init,
      payer=funder,
      space = ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(
            &[ExtensionType::MetadataPointer, ExtensionType::TokenMetadata]
        )?,
      owner = token_program.key(), // works with Interface
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(
      init,
      payer = funder,
      associated_token::mint = position_mint,
      associated_token::authority = owner,
    )]
    pub position_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub lilpool: Box<Account<'info, Lilpool>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/*
  Opens a new lilpool Position.
*/
pub fn handler(ctx: Context<OpenPosition>, token_a_amount: u64, token_b_amount: u64) -> Result<()> {
    let lilpool = &ctx.accounts.lilpool;
    let position_mint = &ctx.accounts.position_mint;
    let position = &mut ctx.accounts.position;

    position.set_inner(Position {
        lilpool: lilpool.key(),
        funder: ctx.accounts.funder.key(),
        position_mint: position_mint.key(),
        token_a_amount,
        token_b_amount,
    });

    mint_position_token_and_remove_authority(
        &ctx.accounts.lilpool,
        &ctx.accounts.position,
        &ctx.accounts.position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_program,
    )
}
