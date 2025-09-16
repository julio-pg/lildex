use anchor_lang::prelude::*;

pub mod whirlpool_nft_update_auth {
    use super::*;
    declare_id!("3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr");
}

// Based on Metaplex TokenMetadata
//
// METADATA_NAME   : max  32 bytes
// METADATA_SYMBOL : max  10 bytes
// METADATA_URI    : max 200 bytes
pub const LP_METADATA_NAME: &str = "Lilpool Position";
pub const LP_METADATA_SYMBOL: &str = "OLP";
pub const LP_METADATA_URI: &str = "https://cyan-magnificent-dingo-615.mypinata.cloud/ipfs/bafkreihxt7eiszrelgc4v6t6o5oktryekkhgle2oeit2uktf2pu5w2cf6m";

// Based on Token-2022 TokenMetadata extension
//
// There is no clear upper limit on the length of name, symbol, and uri,
// but it is safe for wallet apps to limit the uri to 128 bytes.
//
// see also: TokenMetadata struct
// https://github.com/solana-labs/solana-program-library/blob/cd6ce4b7709d2420bca60b4656bbd3d15d2e1485/token-metadata/interface/src/state.rs#L25
pub const LP_2022_METADATA_NAME_PREFIX: &str = "OLP";
pub const LP_2022_METADATA_SYMBOL: &str = "OLP";
pub const LP_2022_METADATA_URI_BASE: &str = "https://cyan-magnificent-dingo-615.mypinata.cloud/ipfs/bafkreihxt7eiszrelgc4v6t6o5oktryekkhgle2oeit2uktf2pu5w2cf6m";
