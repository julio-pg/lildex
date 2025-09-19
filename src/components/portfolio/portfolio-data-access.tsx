import { getProgramAccountsDecoded } from '@/lib/accounts'
import {
  fetchLilpool,
  getClosePositionInstruction,
  getDecreaseLiquidityInstruction,
  getPositionDecoder,
  Position,
  POSITION_DISCRIMINATOR,
} from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { Account, address, getBase58Decoder } from 'gill'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { getTokenMetadata, solanaTokenAddress, TokenMetadata } from '@/lib/utils'
import { findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { parsedPostion } from '@/context/portfolio-context'

export type PositonAccount = Account<Position, string>
export function usePositionAccountsQuery() {
  const { account, client } = useWalletUi()
  const programId = useLildexProgramId()
  const signer = useWalletUiSigner()

  return useQuery({
    retry: false,
    queryKey: ['get-postion-accounts', account?.address],
    queryFn: async () => {
      const positions = (await getProgramAccountsDecoded(client.rpc, {
        decoder: getPositionDecoder(),
        filter: getBase58Decoder().decode(POSITION_DISCRIMINATOR),
        programAddress: programId,
        walletAddress: account?.address,
      })) as PositonAccount[]

      const results = []
      for (const { data: postion, address } of positions) {
        let metadataTokenA!: TokenMetadata
        let metadataTokenB!: TokenMetadata
        try {
          const { data: lilpoolData } = await fetchLilpool(client.rpc, postion?.lilpool)

          const tokenAInfo = await getTokenMetadata(client.rpc, signer?.address, lilpoolData.tokenMintA)
          metadataTokenA = tokenAInfo
          const tokenBInfo = await getTokenMetadata(client.rpc, signer?.address, lilpoolData.tokenMintB)
          metadataTokenB = tokenBInfo
        } catch (error) {
          console.log(error)
        }
        results.push({
          ...postion,
          address,
          metadataTokenA,
          metadataTokenB,
        })
      }
      return results
    },
  })
}

export function useClosePositionMutation({ selectedPosition }: { selectedPosition: parsedPostion }) {
  const signer = useWalletUiSigner()
  const { client } = useWalletUi()
  const signAndSend = useWalletTransactionSignAndSend()

  const lilpoolPda = selectedPosition?.lilpool
  const positionAddress = selectedPosition?.address
  const positionMint = selectedPosition?.positionMint
  const tokenABigIntAmount = selectedPosition?.tokenAAmount
  const tokenBBigIntAmount = selectedPosition?.tokenBAmount
  const tokenProgramA = address(selectedPosition?.metadataTokenA.tokenProgram || solanaTokenAddress)
  const tokenProgramB = address(selectedPosition?.metadataTokenB.tokenProgram || solanaTokenAddress)
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const { data: lilpoolData } = await fetchLilpool(client.rpc, lilpoolPda)

      const [postionTokenAccount] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: positionMint,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      })
      const tokenMintA = lilpoolData?.tokenMintA
      const tokenMintB = lilpoolData?.tokenMintB
      const tokenVaultA = lilpoolData?.tokenVaultA
      const tokenVaultB = lilpoolData?.tokenVaultB

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
      const closePositionIx = getClosePositionInstruction({
        positionAuthority: signer,
        receiver: signer.address,
        position: positionAddress,
        positionMint: positionMint,
        positionTokenAccount: postionTokenAccount,
        token2022Program: TOKEN_2022_PROGRAM_ADDRESS,
      })
      const decreaseLiquidityIx = getDecreaseLiquidityInstruction({
        lilpool: lilpoolPda,
        position: positionAddress,
        positionAuthority: signer,
        positionTokenAccount: postionTokenAccount,
        tokenMintA: tokenMintA,
        tokenMintB: tokenMintB,
        tokenOwnerAccountA: funderTokenAccountA,
        tokenOwnerAccountB: funderTokenAccountB,
        tokenVaultA: tokenVaultA,
        tokenVaultB: tokenVaultB,
        tokenMaxA: tokenABigIntAmount,
        tokenMaxB: tokenBBigIntAmount,
        tokenProgramA: tokenProgramA,
        tokenProgramB: tokenProgramB,
      })
      return signAndSend([decreaseLiquidityIx, closePositionIx], signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, 'Postion Closed with success')
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })
}
