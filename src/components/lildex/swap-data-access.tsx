import { fetchLilpool, getSwapInstruction, Lilpool } from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { getTokenMetadata, numberToBigintPrice, solanaTokenAddress, TokenMetadata } from '@/lib/utils'
import { Account, address, getAddressEncoder, getProgramDerivedAddress, getUtf8Encoder } from 'gill'
import { findAssociatedTokenPda } from 'gill/programs'
import { useWalletUi } from '@wallet-ui/react'
import { useLildexProgramId } from './lildex-data-access'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'

export function useGetListedTokensQuery({ listedTokens }: { listedTokens: TokenMetadata[] }) {
  const { client } = useWalletUi()
  const signer = useWalletUiSigner()

  return useQuery({
    queryKey: ['listed-tokens'],
    queryFn: async () => {
      const results = []
      for (const data of listedTokens) {
        let tokenMetadata!: TokenMetadata
        try {
          const tokenAddress = address(data.address)
          tokenMetadata = await getTokenMetadata(client.rpc, signer?.address, tokenAddress)
        } catch (error) {
          console.log(error)
        }
        results.push(tokenMetadata)
      }
      return results
    },
  })
}

export function useGetLilpoolAddressQuery({ tokenMintA, tokenMintB }: { tokenMintA: string; tokenMintB: string }) {
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)
  const programId = useLildexProgramId()
  const { client } = useWalletUi()

  async function deriveAndFetch(a: string, b: string) {
    const [configPda] = await getProgramDerivedAddress({
      programAddress: programId,
      seeds: [textEncoder.encode('config'), addressEncoder.encode(testWallet)],
    })
    const [lilpollPda] = await getProgramDerivedAddress({
      programAddress: programId,
      seeds: [
        textEncoder.encode('lilpool'),
        addressEncoder.encode(configPda),
        addressEncoder.encode(address(a)),
        addressEncoder.encode(address(b)),
      ],
    })
    try {
      return await fetchLilpool(client.rpc, lilpollPda) // return data or throw/not found
    } catch (err) {
      return null
    }
  }

  return useQuery({
    queryKey: ['lilpool-Address', tokenMintA, tokenMintB],
    queryFn: async () => {
      // try given order first (fast if it matches)
      let data = await deriveAndFetch(tokenMintA, tokenMintB)
      if (data) return data
      // try swapped order
      data = await deriveAndFetch(tokenMintB, tokenMintA)
      return data
    },
  })
}

export function useCreateSwapMutation({
  amountIn,
  amountOut,
  selectedAtoken,
  selectedBtoken,
  lilpoolData,
}: {
  amountIn: string
  amountOut: string
  selectedAtoken: TokenMetadata
  selectedBtoken: TokenMetadata
  lilpoolData: Account<Lilpool, string>
}) {
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()
  const ADecimals = BigInt(selectedAtoken?.decimals || 1)
  const BDecimals = BigInt(selectedBtoken?.decimals || 1)
  const tokenABigIntAmount = numberToBigintPrice(Number(amountIn), ADecimals)
  const tokenBBigIntAmount = numberToBigintPrice(Number(amountOut), BDecimals)

  const lilpoolAddress = lilpoolData?.address
  const tokenProgramA = address(selectedAtoken?.tokenProgram! || solanaTokenAddress)
  const tokenProgramB = address(selectedBtoken?.tokenProgram! || solanaTokenAddress)

  const tokenVaultA = lilpoolData?.data.tokenVaultA
  const tokenVaultB = lilpoolData?.data.tokenVaultB
  const tokenMintA = lilpoolData?.data.tokenMintA
  const tokenMintB = lilpoolData?.data.tokenMintB
  // isAtoB validation
  const poolMintA = lilpoolData?.data.tokenMintA
  const poolMintB = lilpoolData?.data.tokenMintB
  const selectedTokenAMint = selectedAtoken?.address
  const selectedTokenBMint = selectedBtoken?.address

  const isAtoB = poolMintA == selectedTokenAMint && poolMintB == selectedTokenBMint
  return useMutation({
    mutationKey: ['create-swap'],
    mutationFn: async () => {
      const [funderTokenAccountA] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: poolMintA,
        tokenProgram: tokenProgramA,
      })
      const [funderTokenAccountB] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: poolMintB,
        tokenProgram: tokenProgramB,
      })

      return signAndSend(
        getSwapInstruction({
          tokenAuthority: signer,
          lilpool: lilpoolAddress,
          amountIn: tokenABigIntAmount,
          amountOut: tokenBBigIntAmount,
          aToB: isAtoB,
          tokenMintA: tokenMintA,
          tokenMintB: tokenMintB,
          tokenOwnerAccountA: funderTokenAccountA,
          tokenOwnerAccountB: funderTokenAccountB,
          tokenVaultA: tokenVaultA,
          tokenVaultB: tokenVaultB,
          tokenProgramA: tokenProgramA,
          tokenProgramB: tokenProgramB,
        }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx, 'Swap finished with success')
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })
}
