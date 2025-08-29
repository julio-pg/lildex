use anchor_lang::prelude::*;

use crate::auth::admin::is_admin_key;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(init, payer = funder, space = WhirlpoolsConfig::INIT_SPACE)]
    pub config: Account<'info, WhirlpoolsConfig>,

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
    Ok(())
}
