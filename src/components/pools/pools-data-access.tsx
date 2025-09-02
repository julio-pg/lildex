import { getProgramAccountsDecoded } from '@/lib/accounts'
import { getLilpoolDecoder, LILDEX_PROGRAM_ADDRESS, Lilpool, LILPOOL_DISCRIMINATOR } from '@project/anchor'
import { useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { Account, getBase58Decoder } from 'gill'

export type PoolAccount = Account<Lilpool, string>
export function usePoolAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    retry: false,
    queryKey: ['get-pool accounts'],
    queryFn: () =>
      getProgramAccountsDecoded(client.rpc, {
        decoder: getLilpoolDecoder(),
        filter: getBase58Decoder().decode(LILPOOL_DISCRIMINATOR),
        programAddress: LILDEX_PROGRAM_ADDRESS,
      }) as Promise<PoolAccount[]>,
  })
}
