use anchor_lang::prelude::*;

use crate::auth::admin::is_admin_key;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init, 
        payer = funder,
        space = LilpoolsConfig::DISCRIMINATOR.len() + LilpoolsConfig::INIT_SPACE,
        seeds = [b"lil", funder.key().as_ref()],
        bump
    )]
    pub config: Account<'info, LilpoolsConfig>,

    #[account(mut, constraint = is_admin_key(funder.key))]
    pub funder: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeConfig>,
    fee_authority: Pubkey,
    default_protocol_fee_rate: u16,
) -> Result<()> {
    // Create the config account
    ctx.accounts.config.set_inner(LilpoolsConfig {
        fee_authority,
        default_protocol_fee_rate,
    });
    Ok(())
}
