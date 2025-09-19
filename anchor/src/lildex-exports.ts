// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
// import { Lildex, LILDEX_DISCRIMINATOR, LILDEX_PROGRAM_ADDRESS, getLildexDecoder } from './client/js/generated'
import LildexIDL from '../target/idl/lildex.json'
import * as programClient from '../src/client/js/generated'
import { Lildex } from 'anchor/target/types/lildex'

export type LildexAccount = Account<Lildex, string>

// Re-export the generated IDL and type
export { LildexIDL }

// This is a helper function to get the program ID for the Lildex program depending on the cluster.
export function getLildexProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
    case 'solana:mainnet':
    default:
      return programClient.LILDEX_PROGRAM_ADDRESS
  }
}

export * from './client/js/generated'

export function getLildexProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: programClient.getLilpoolDecoder(),
    filter: getBase58Decoder().decode(programClient.LILPOOL_DISCRIMINATOR),
    programAddress: programClient.LILDEX_PROGRAM_ADDRESS,
  })
}
