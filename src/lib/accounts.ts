// get-program-accounts.ts
import {
  AccountInfoBase,
  AccountInfoWithBase64EncodedData,
  Address,
  Base58EncodedBytes,
  decodeAccount,
  Decoder,
  MaybeEncodedAccount,
  parseBase64RpcAccount,
  SolanaClient,
} from 'gill'

export interface GetProgramAccountsConfig {
  filter: string
  programAddress: Address
}

export async function getProgramAccounts(rpc: SolanaClient['rpc'], config: GetProgramAccountsConfig) {
  return await rpc
    .getProgramAccounts(config.programAddress, {
      encoding: 'jsonParsed',
      filters: [
        {
          memcmp: { offset: 0n, bytes: config.filter as Base58EncodedBytes, encoding: 'base58' },
        },
      ],
    })
    .send()
}

// get-program-accounts-decoded.ts

export interface getProgramAccountsDecodedConfig<T extends object> extends GetProgramAccountsConfig {
  decoder: Decoder<T>
}

export async function getProgramAccountsDecoded<T extends object>(
  rpc: SolanaClient['rpc'],
  config: getProgramAccountsDecodedConfig<T>,
) {
  const programAccounts = await getProgramAccounts(rpc, {
    filter: config.filter,
    programAddress: config.programAddress,
  })

  const encodedAccounts: Array<MaybeEncodedAccount> = programAccounts.map((item) => {
    const account = parseBase64RpcAccount(
      item.pubkey,
      item.account as AccountInfoBase & AccountInfoWithBase64EncodedData,
    )
    return {
      ...account,
      data: Buffer.from(account.data),
      exists: true,
    }
  })

  return encodedAccounts.map((item) => {
    return decodeAccount(item, config.decoder)
  })
}
