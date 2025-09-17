import {
  getIncreaseLiquidityInstruction,
  getInitializePoolInstruction,
  getOpenPositionInstruction,
} from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletUiSigner } from '@wallet-ui/react'
import { address, generateKeyPairSigner, getAddressEncoder, getProgramDerivedAddress, getUtf8Encoder } from 'gill'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
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
  const tokenProgramA = address(tokenAData?.tokenProgram!)
  const tokenProgramB = address(tokenBData?.tokenProgram!)

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
      const [lilpoolPda] = await getProgramDerivedAddress({
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

      const [funderTokenAccountA] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: tokenMintA,
        tokenProgram: tokenProgramA,
      })
      const [funderTokenAccountB] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: tokenMintB,
        tokenProgram: tokenProgramB,
      })

      const tokenVaultA = await generateKeyPairSigner()

      const tokenVaultB = await generateKeyPairSigner()

      const initPoolIx = getInitializePoolInstruction({
        lilpoolsConfig: configPda,
        tokenMintA: tokenMintA,
        tokenMintB: tokenMintB,
        funder: signer,
        lilpool: lilpoolPda,
        tokenVaultA: tokenVaultA,
        tokenVaultB: tokenVaultB,
        initialPrice: initialPriceBigIntAmount,
        tokenProgramA: tokenProgramA,
        tokenProgramB: tokenProgramB,
      })

      const openPositionIx = getOpenPositionInstruction({
        funder: signer,
        owner: signer.address,
        positionMint: postionTokenMint,
        positionTokenAccount: postionTokenAccount,
        position: positionAddress,
        lilpool: lilpoolPda,
        tokenAAmount: tokenABigIntAmount,
        tokenBAmount: tokenBBigIntAmount,
        metadataUpdateAuth: testWallet,
        token2022Program: TOKEN_2022_PROGRAM_ADDRESS,
      })

      const increaseLiquidityIx = getIncreaseLiquidityInstruction({
        lilpool: lilpoolPda,
        position: positionAddress,
        positionAuthority: signer,
        positionTokenAccount: postionTokenAccount,
        tokenMintA: tokenMintA,
        tokenMintB: tokenMintB,
        tokenOwnerAccountA: funderTokenAccountA,
        tokenOwnerAccountB: funderTokenAccountB,
        tokenVaultA: tokenVaultA.address,
        tokenVaultB: tokenVaultB.address,
        tokenMaxA: tokenABigIntAmount,
        tokenMaxB: tokenBBigIntAmount,
        tokenProgramA: tokenProgramA,
        tokenProgramB: tokenProgramB,
      })

      return await signAndSend([initPoolIx, openPositionIx, increaseLiquidityIx], signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
    },
    onError: (e: any) => {
      toast.error(e.message)
    },
  })
}
