import { getInitializePoolInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react'
import {
  address,
  Address,
  getAddressEncoder,
  getProgramDerivedAddress,
  getSolanaErrorFromInstructionError,
  getSolanaErrorFromTransactionError,
  getUtf8Encoder,
} from 'gill'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useGetTokenAccountAddressQuery } from '../account/account-data-access'
import { TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { getTokenBigInt, useGetTokenAccountAddress } from '@/lib/utils'

export function useInitializePoolMutation({
  tokenMintA,
  tokenMintB,
  tokenAAmount,
  tokenBAmount,
  initialPrice,
}: {
  tokenMintA: Address
  tokenMintB: Address
  tokenAAmount: string
  tokenBAmount: string
  initialPrice: string
}) {
  const signAndSend = useWalletTransactionSignAndSend()
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const signer = useWalletUiSigner()
  const programId = useLildexProgramId()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)
  const { client } = useWalletUi()

  const funderTokenAccountA = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintA,
    useTokenExtensions: false,
  })
  const funderTokenAccountB = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintB,
    useTokenExtensions: false,
  })

  const tokenABigIntAmount = getTokenBigInt(Number(tokenAAmount), 9)
  const tokenBBigIntAmount = getTokenBigInt(Number(tokenBAmount), 9)
  const initialPriceBigIntAmount = getTokenBigInt(Number(initialPrice), 9)
  return useMutation({
    mutationFn: async () => {
      const [configPda] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [textEncoder.encode('config'), addressEncoder.encode(testWallet)],
      })
      const [lilpollPda] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [
          textEncoder.encode('lilpool'),
          addressEncoder.encode(configPda),
          addressEncoder.encode(tokenMintA),
          addressEncoder.encode(tokenMintB),
        ],
      })

      const tokenVaultA = await useGetTokenAccountAddress({
        wallet: lilpollPda,
        mint: tokenMintA,
        useTokenExtensions: true,
      })
      const tokenVaultB = await useGetTokenAccountAddress({
        wallet: lilpollPda,
        mint: tokenMintB,
        useTokenExtensions: true,
      })
      return await signAndSend(
        getInitializePoolInstruction({
          lilpoolsConfig: configPda,
          tokenMintA: tokenMintA,
          tokenMintB: tokenMintB,
          funder: signer,
          lilpool: lilpollPda,
          tokenVaultA: tokenVaultA,
          tokenVaultB: tokenVaultB,
          funderTokenAccountA: funderTokenAccountA.data!,
          funderTokenAccountB: funderTokenAccountB.data!,
          initialPrice: initialPriceBigIntAmount,
          tokenAAmount: tokenABigIntAmount,
          tokenBAmount: tokenBBigIntAmount,
          tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx)
    },
    onError: (e) => {
      toast.error(e.message)

      // const errorLog = getSolanaErrorFromInstructionError()
      // console.log(errorLog)
    },
  })
}
