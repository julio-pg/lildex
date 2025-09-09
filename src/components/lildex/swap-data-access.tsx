import { fetchLilpool, getSwapInstruction } from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { getUserListedTokens, numberToBigintPrice, TokenMetadata, useGetTokenAccountAddress } from '@/lib/utils'
import { Address } from 'gill'
import { TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { useWalletUi } from '@wallet-ui/react'

export function useGetListedTokensQuery({ wallet, listedTokens }: { wallet: Address; listedTokens: TokenMetadata[] }) {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['listed-tokens'],
    queryFn: async () => await getUserListedTokens(client, wallet, listedTokens),
  })
}

export function useCreateSwapMutation({
  aToB,
  amountIn,
  amountOut,
  lilpoolAddress,
}: {
  aToB: boolean
  amountIn: string
  amountOut: string
  lilpoolAddress: Address
}) {
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()
  const { client } = useWalletUi()
  const tokenABigIntAmount = numberToBigintPrice(Number(amountIn), 9n)
  const tokenBBigIntAmount = numberToBigintPrice(Number(amountOut), 9n)
  return useMutation({
    mutationKey: ['create-swap'],
    mutationFn: async () => {
      const { data: lilpoolData } = await fetchLilpool(client.rpc, lilpoolAddress)
      // getTokenMetadata
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
      signAndSend(
        getSwapInstruction({
          receiver: signer,
          lilpool: lilpoolAddress,
          amountIn: tokenABigIntAmount,
          amountOut: tokenBBigIntAmount,
          aToB: aToB,
          tokenMintA: lilpoolData.tokenMintA,
          tokenMintB: lilpoolData.tokenMintB,
          tokenReceiverAccountA: funderTokenAccountA,
          tokenReceiverAccountB: funderTokenAccountB,
          tokenVaultA: tokenVaultA,
          tokenVaultB: tokenVaultB,
          tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        }),
        signer,
      )
    },
  })
}
