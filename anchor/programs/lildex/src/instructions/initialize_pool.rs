use crate::events::PoolInitialized;
use crate::state::*;
use crate::util::*;
use crate::{errors::ErrorCode, math::MAX_PROTOCOL_LIQUIDITY};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenInterface},
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    pub lilpools_config: Box<Account<'info, LilpoolsConfig>>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(
      init,
      payer = funder,
      seeds = [
        b"lilpool",
        lilpools_config.key().as_ref(),
        token_mint_a.key().as_ref(),
        token_mint_b.key().as_ref(),
      ],
      space = Lilpool::DISCRIMINATOR.len() + Lilpool::INIT_SPACE,
      bump,
    )]
    pub lilpool: Box<Account<'info, Lilpool>>,
    /// CHECK: initialized in the handler
    #[account(mut)]
    pub token_vault_a: Signer<'info>,

    /// CHECK: initialized in the handler
    #[account(mut)]
    pub token_vault_b: Signer<'info>,

    #[account(address = *token_mint_a.to_account_info().owner)]
    pub token_program_a: Interface<'info, TokenInterface>,
    #[account(address = *token_mint_b.to_account_info().owner)]
    pub token_program_b: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePool>, initial_price: u64) -> Result<()> {
    // Validate token mints are different
    require!(
        ctx.accounts.token_mint_a.key() != ctx.accounts.token_mint_b.key(),
        ErrorCode::InvalidTokenMint,
    );
    // Validate amounts
    require!(initial_price > 0, ErrorCode::InvalidAmount);
    require!(initial_price > 0, ErrorCode::InvalidAmount);

    let lilpool = &mut ctx.accounts.lilpool;

    initialize_vault_token_account(
        lilpool,
        &ctx.accounts.token_vault_a,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.funder,
        &ctx.accounts.token_program_a,
        &ctx.accounts.system_program,
    )?;
    initialize_vault_token_account(
        lilpool,
        &ctx.accounts.token_vault_b,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.funder,
        &ctx.accounts.token_program_b,
        &ctx.accounts.system_program,
    )?;

    let bump = ctx.bumps.lilpool;

    ctx.accounts.lilpool.set_inner(Lilpool {
        lilpools_config: ctx.accounts.lilpools_config.key(),
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_vault_a: ctx.accounts.token_vault_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(),
        token_vault_b: ctx.accounts.token_vault_b.key(),
        protocol_fee_rate: ctx.accounts.lilpools_config.default_protocol_fee_rate,
        funder: ctx.accounts.funder.key(),
        liquidity: MAX_PROTOCOL_LIQUIDITY,
        price: initial_price,
        lilpool_bump: [bump],
    });

    emit!(PoolInitialized {
        lilpool: ctx.accounts.lilpool.key(),
        lilpools_config: ctx.accounts.lilpools_config.key(),
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(),
        token_program_a: ctx.accounts.token_program_a.key(),
        token_program_b: ctx.accounts.token_program_b.key(),
        decimals_a: ctx.accounts.token_mint_a.decimals,
        decimals_b: ctx.accounts.token_mint_b.decimals,
        initial_price,
    });
    Ok(())
}
