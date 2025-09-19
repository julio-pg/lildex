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
  walletAddress?: string
}

export async function getProgramAccounts(rpc: SolanaClient['rpc'], config: GetProgramAccountsConfig) {
  const filters: any[] = [
    {
      memcmp: { offset: 0, bytes: config.filter as Base58EncodedBytes, encoding: 'base58' },
    },
  ]

  if (config.walletAddress) {
    filters.push({
      memcmp: {
        offset: 40,
        bytes: config.walletAddress,
        encoding: 'base58',
      },
    })
  }
  console.log(filters)
  return await rpc
    .getProgramAccounts(config.programAddress, {
      encoding: 'jsonParsed',
      filters: filters,
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
    walletAddress: config.walletAddress,
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
