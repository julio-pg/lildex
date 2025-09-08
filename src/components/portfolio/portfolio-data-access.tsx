import { getProgramAccountsDecoded } from '@/lib/accounts'
import {
  fetchLilpool,
  fetchPosition,
  getClosePositionInstruction,
  getPositionDecoder,
  Position,
  POSITION_DISCRIMINATOR,
} from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import {
  Account,
  Address,
  address,
  getAddressEncoder,
  getBase58Decoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
} from 'gill'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { numberToBigintPrice, useGetTokenAccountAddress } from '@/lib/utils'
import { TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'

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

export function useClosePositionMutation({
  lilpoolAddress,
  positionAddress,
  positionMint,
}: {
  lilpoolAddress: Address
  positionAddress: Address
  positionMint: Address
}) {
  const signer = useWalletUiSigner()
  const { client } = useWalletUi()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    retry: false,
    mutationFn: async () => {
      const { data: lilpoolData } = await fetchLilpool(client.rpc, lilpoolAddress)
      const postionTokenAccount = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: positionMint,
        useTokenExtensions: true,
      })

      const tokenVaultA = await useGetTokenAccountAddress({
        wallet: lilpoolAddress,
        mint: lilpoolData.tokenMintA,
        useTokenExtensions: true,
      })
      const tokenVaultB = await useGetTokenAccountAddress({
        wallet: lilpoolAddress,
        mint: lilpoolData.tokenMintB,
        useTokenExtensions: true,
      })
      const funderTokenAccountA = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: lilpoolData.tokenMintA,
        useTokenExtensions: true,
      })
      const funderTokenAccountB = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: lilpoolData.tokenMintB,
        useTokenExtensions: true,
      })
      return signAndSend(
        getClosePositionInstruction({
          positionAuthority: signer,
          receiver: signer.address,
          position: positionAddress,
          positionMint: positionMint,
          positionTokenAccount: postionTokenAccount,
          tokenMintA: lilpoolData.tokenMintA,
          tokenMintB: lilpoolData.tokenMintB,
          tokenVaultA: tokenVaultA,
          tokenVaultB: tokenVaultB,
          funderTokenAccountA: funderTokenAccountA,
          funderTokenAccountB: funderTokenAccountB,
          tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx, 'Postion Closed with success')
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })
}
