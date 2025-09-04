import { getProgramAccountsDecoded } from '@/lib/accounts'
import { getOpenPositionInstruction, getPositionDecoder, Position, POSITION_DISCRIMINATOR } from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import {
  Account,
  address,
  Address,
  generateKeyPairSigner,
  getAddressEncoder,
  getBase58Decoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
} from 'gill'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { useGetTokenAccountAddressQuery } from '../account/account-data-access'
import { getTokenBigInt, useGetTokenAccountAddress } from '@/lib/utils'
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
export function useOpenPositionMutation({
  tokenMintA,
  tokenMintB,
  tokenAAmount,
  tokenBAmount,
}: {
  tokenMintA: Address
  tokenMintB: Address
  tokenAAmount: string
  tokenBAmount: string
}) {
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const programId = useLildexProgramId()
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)

  const funderTokenAccountA = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintA,
  })
  const funderTokenAccountB = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintB,
  })

  const tokenABigIntAmount = getTokenBigInt(Number(tokenAAmount), 9)
  const tokenBBigIntAmount = getTokenBigInt(Number(tokenBAmount), 9)

  return useMutation({
    retry: false,
    mutationFn: async () => {
      const postionTokenMint = await generateKeyPairSigner()
      const postionTokenAccount = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: postionTokenMint.address,
        useTokenExtensions: true,
      })
      const [positionAddress] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [textEncoder.encode('position'), addressEncoder.encode(postionTokenMint.address)],
      })
      const [configPda] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [textEncoder.encode('config'), addressEncoder.encode(testWallet)],
      })
      const [lilpoolAddress] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [
          textEncoder.encode('lilpool'),
          addressEncoder.encode(configPda),
          addressEncoder.encode(tokenMintA),
          addressEncoder.encode(tokenMintB),
        ],
      })
      const tokenVaultA = await useGetTokenAccountAddress({
        wallet: lilpoolAddress,
        mint: tokenMintA,
        useTokenExtensions: true,
      })
      const tokenVaultB = await useGetTokenAccountAddress({
        wallet: lilpoolAddress,
        mint: tokenMintB,
        useTokenExtensions: true,
      })
      const funderTokenAccountA = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: tokenMintA,
        useTokenExtensions: true,
      })
      const funderTokenAccountB = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: tokenMintB,
        useTokenExtensions: true,
      })
      return signAndSend(
        getOpenPositionInstruction({
          funder: signer,
          owner: signer.address,
          tokenMintA: tokenMintA,
          tokenMintB: tokenMintB,
          positionMint: postionTokenMint,
          positionTokenAccount: postionTokenAccount,
          position: positionAddress,
          lilpool: lilpoolAddress,
          tokenVaultA: tokenVaultA,
          tokenVaultB: tokenVaultB,
          funderTokenAccountA: funderTokenAccountA,
          funderTokenAccountB: funderTokenAccountB,
          tokenAAmount: tokenABigIntAmount,
          tokenBAmount: tokenBBigIntAmount,
          tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx, 'Postion Open with success')
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })
}
