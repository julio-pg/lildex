use crate::state::*;
use crate::{errors::ErrorCode, math::MAX_PROTOCOL_LIQUIDITY};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    pub lilpools_config: Box<Account<'info, LilpoolsConfig>>,
    pub token_mint_a: Account<'info, Mint>,
    pub token_mint_b: Account<'info, Mint>,
    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(init,
      seeds = [
        b"lilpool".as_ref(),
        lilpools_config.key().as_ref(),
        token_mint_a.key().as_ref(),
        token_mint_b.key().as_ref(),
      ],
      bump,
      payer = funder,
      space = Lilpool::INIT_SPACE)]
    pub lilpool: Box<Account<'info, Lilpool>>,
    #[account(init,
      payer = funder,
      token::mint = token_mint_a,
      token::authority = lilpool)]
    pub token_vault_a: Box<Account<'info, TokenAccount>>,

    #[account(init,
      payer = funder,
      token::mint = token_mint_b,
      token::authority = lilpool)]
    pub token_vault_b: Box<Account<'info, TokenAccount>>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePool>, initial_price: u128) -> Result<()> {
    let token_mint_a = ctx.accounts.token_mint_a.key();
    let token_mint_b = ctx.accounts.token_mint_b.key();

    require!(
        token_mint_a != token_mint_b,
        ErrorCode::InvalidTokenMintOrder,
    );

    // if !(MIN_SQRT_PRICE_X64..=MAX_SQRT_PRICE_X64).contains(&sqrt_price) {
    //     return Err(ErrorCode::SqrtPriceOutOfBounds.into());
    // }
    ctx.accounts.lilpool.set_inner(Lilpool {
        lilpools_config: ctx.accounts.lilpools_config.key(),
        token_mint_a: token_mint_a,
        token_mint_b: token_mint_b,
        protocol_fee_rate: ctx.accounts.lilpools_config.default_protocol_fee_rate,
        funder: ctx.accounts.funder.key(),
        liquidity: MAX_PROTOCOL_LIQUIDITY,
        price: initial_price,
    });
    Ok(())
}
