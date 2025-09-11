import { getInitializePoolInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react'
import {
  address,
  Address,
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
  getSolanaErrorFromInstructionError,
  getUtf8Encoder,
} from 'gill'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useGetTokenAccountAddressQuery } from '../account/account-data-access'
import { findAssociatedTokenPda, isExtension, TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import {
  initialPriceDecimals,
  numberToBigintPrice,
  solanaTokenAddress,
  TokenMetadata,
  useGetTokenAccountAddress,
} from '@/lib/utils'

export function useInitializePoolMutation({
  tokenAData,
  tokenBData,
  tokenAAmount,
  tokenBAmount,
  initialPrice,
}: {
  tokenAData: TokenMetadata
  tokenBData: TokenMetadata
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

  const tokenMintA = address(tokenAData?.address || solanaTokenAddress)
  const tokenMintB = address(tokenBData?.address || solanaTokenAddress)
  const decimalsA = BigInt(tokenAData?.decimals || 1n)
  const decimalsB = BigInt(tokenBData?.decimals || 1n)

  const funderTokenAccountA = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintA,
  })
  const funderTokenAccountB = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintB,
  })

  const tokenABigIntAmount = numberToBigintPrice(Number(tokenAAmount), decimalsA)
  const tokenBBigIntAmount = numberToBigintPrice(Number(tokenBAmount), decimalsB)
  const initialPriceBigIntAmount = numberToBigintPrice(Number(initialPrice), initialPriceDecimals)
  return useMutation({
    mutationFn: async () => {
      const postionTokenMint = await generateKeyPairSigner()

      const postionTokenAccount = await useGetTokenAccountAddress({
        wallet: signer.address,
        mint: postionTokenMint.address,
        useTokenExtensions: true,
      })
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
      const [positionAddress] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [textEncoder.encode('position'), addressEncoder.encode(postionTokenMint.address)],
      })

      const [tokenVaultA] = await findAssociatedTokenPda({
        owner: lilpollPda,
        mint: tokenMintA,
        tokenProgram: address(tokenAData?.tokenProgram!),
      })
      const [tokenVaultB] = await findAssociatedTokenPda({
        owner: lilpollPda,
        mint: tokenMintB,
        tokenProgram: address(tokenAData?.tokenProgram!),
      })

      return await signAndSend(
        getInitializePoolInstruction({
          lilpoolsConfig: configPda,
          tokenMintA: tokenMintA,
          tokenMintB: tokenMintB,
          positionMint: postionTokenMint,
          positionTokenAccount: postionTokenAccount,
          position: positionAddress,
          funder: signer,
          owner: signer.address,
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
    onError: (e: any) => {
      toast.error(e.message)
    },
  })
}
