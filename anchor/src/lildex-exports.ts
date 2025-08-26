// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, address, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Lildex, LILDEX_DISCRIMINATOR, LILDEX_PROGRAM_ADDRESS, getLildexDecoder } from './client/js'
import LildexIDL from '../target/idl/lildex.json'

export type LildexAccount = Account<Lildex, string>

// Re-export the generated IDL and type
export { LildexIDL }

// This is a helper function to get the program ID for the Lildex program depending on the cluster.
export function getLildexProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the Lildex program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'solana:mainnet':
    default:
      return LILDEX_PROGRAM_ADDRESS
  }
}

export * from './client/js'

export function getLildexProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getLildexDecoder(),
    filter: getBase58Decoder().decode(LILDEX_DISCRIMINATOR),
    programAddress: LILDEX_PROGRAM_ADDRESS,
  })
}
