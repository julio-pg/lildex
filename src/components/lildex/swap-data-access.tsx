import { fetchLilpool, getSwapInstruction, Lilpool } from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { getUserListedTokens, numberToBigintPrice, TokenMetadata, useGetTokenAccountAddress } from '@/lib/utils'
import { Account, address, Address, getAddressEncoder, getProgramDerivedAddress, getUtf8Encoder } from 'gill'
import { TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { useWalletUi } from '@wallet-ui/react'
import { useLildexProgramId } from './lildex-data-access'

export function useGetListedTokensQuery({ wallet, listedTokens }: { wallet: Address; listedTokens: TokenMetadata[] }) {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['listed-tokens'],
    queryFn: async () => await getUserListedTokens(client.rpc, wallet, listedTokens),
  })
}

export function useGetLilpoolAddressQuery({ tokenMintA, tokenMintB }: { tokenMintA: string; tokenMintB: string }) {
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)
  const programId = useLildexProgramId()
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['lilpool-Address', tokenMintA, tokenMintB],
    queryFn: async () => {
      const [configPda] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [textEncoder.encode('config'), addressEncoder.encode(testWallet)],
      })
      const [lilpollPda] = await getProgramDerivedAddress({
        programAddress: programId,
        seeds: [
          textEncoder.encode('lilpool'),
          addressEncoder.encode(configPda),
          addressEncoder.encode(address(tokenMintA)),
          addressEncoder.encode(address(tokenMintB)),
        ],
      })
      const lilpoolData = await fetchLilpool(client.rpc, lilpollPda)
      return lilpoolData
    },
  })
}

export function useCreateSwapMutation({
  aToB,
  amountIn,
  amountOut,
  lilpoolData,
}: {
  aToB: boolean
  amountIn: string
  amountOut: string
  lilpoolData: Account<Lilpool, string>
}) {
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()
  const { client } = useWalletUi()
  const tokenABigIntAmount = numberToBigintPrice(Number(amountIn), 9n)
  const tokenBBigIntAmount = numberToBigintPrice(Number(amountOut), 9n)
  const lilpoolAddress = lilpoolData?.address
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
