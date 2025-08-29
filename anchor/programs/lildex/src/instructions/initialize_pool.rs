use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitializePool {}
