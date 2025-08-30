use anchor_lang::prelude::*;

#[event]
pub struct Traded {
    pub lilpool: Pubkey,
    pub a_to_b: bool,

    pub input_amount: u64,
    pub output_amount: u64,
    pub input_transfer_fee: u64,
    pub output_transfer_fee: u64,
    // pub protocol_fee: u64,
}
