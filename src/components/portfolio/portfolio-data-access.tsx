import { getProgramAccountsDecoded } from '@/lib/accounts'
import { getPositionDecoder, Position, POSITION_DISCRIMINATOR } from '@project/anchor'
import { useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { Account, getBase58Decoder } from 'gill'
import { useLildexProgramId } from '../lildex/lildex-data-access'

export type PositonAccount = Account<Position, string>
export function usePositionAccountsQuery() {
  const { client } = useWalletUi()
  const programId = useLildexProgramId()
  return useQuery({
    retry: false,
    queryKey: ['get-pool accounts'],
    queryFn: () =>
      getProgramAccountsDecoded(client.rpc, {
        decoder: getPositionDecoder(),
        filter: getBase58Decoder().decode(POSITION_DISCRIMINATOR),
        programAddress: programId,
      }) as Promise<PositonAccount[]>,
  })
}
