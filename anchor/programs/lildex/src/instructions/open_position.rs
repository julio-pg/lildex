use crate::constants::nft::whirlpool_nft_update_auth::ID as LP_NFT_UPDATE_AUTH;
use crate::state::*;
use crate::util::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::spl_token_2022;
use anchor_spl::token_2022::Token2022;

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

    /// CHECK: initialized in the handler
    #[account(mut)]
    pub position_mint: Signer<'info>,

    /// CHECK: initialized in the handler
    #[account(mut)]
    pub position_token_account: UncheckedAccount<'info>,

    pub lilpool: Box<Account<'info, Lilpool>>,

    #[account(address = spl_token_2022::ID)]
    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// CHECK: checked via account constraints
    #[account(address = LP_NFT_UPDATE_AUTH)]
    pub metadata_update_auth: UncheckedAccount<'info>,
}

/*
  Opens a new lilpool Position.
*/
pub fn handler(ctx: Context<OpenPosition>, token_a_amount: u64, token_b_amount: u64) -> Result<()> {
    let lilpool = &ctx.accounts.lilpool;
    let position_mint = &ctx.accounts.position_mint;
    let position = &mut ctx.accounts.position;

    let position_seeds = [
        b"position",
        position_mint.key.as_ref(),
        &[ctx.bumps.position],
    ];

    position.set_inner(Position {
        lilpool: lilpool.key(),
        funder: ctx.accounts.funder.key(),
        position_mint: position_mint.key(),
        token_a_amount,
        token_b_amount,
    });

    initialize_position_mint_2022(
        position_mint,
        &ctx.accounts.funder,
        position,
        &ctx.accounts.system_program,
        &ctx.accounts.token_2022_program,
        true,
    )?;

    let (name, symbol, uri) = build_position_token_metadata(position_mint, position, lilpool);

    initialize_token_metadata_extension(
        name,
        symbol,
        uri,
        position_mint,
        position,
        &ctx.accounts.metadata_update_auth,
        &ctx.accounts.funder,
        &ctx.accounts.system_program,
        &ctx.accounts.token_2022_program,
        &position_seeds,
    )?;

    initialize_position_token_account_2022(
        &ctx.accounts.position_token_account,
        position_mint,
        &ctx.accounts.funder,
        &ctx.accounts.owner,
        &ctx.accounts.token_2022_program,
        &ctx.accounts.system_program,
        &ctx.accounts.associated_token_program,
    )?;

    mint_position_token_2022_and_remove_authority(
        position,
        position_mint,
        &ctx.accounts.position_token_account,
        &ctx.accounts.token_2022_program,
        &position_seeds,
    )?;
    Ok(())
}
