import { getProgramAccountsDecoded } from '@/lib/accounts'
import {
  getLilpoolDecoder,
  getOpenPositionInstruction,
  LILDEX_PROGRAM_ADDRESS,
  Lilpool,
  LILPOOL_DISCRIMINATOR,
} from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import {
  Account,
  Address,
  address,
  generateKeyPairSigner,
  getAddressEncoder,
  getBase58Decoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
  none,
} from 'gill'
import { Extension, fetchMint, TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { numberToBigintPrice, solanaTokenAddress, useGetTokenAccountAddress } from '@/lib/utils'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useLildexProgramId } from '../lildex/lildex-data-access'

export function useGetMintQuery({ mint }: { mint: Address }) {
  const { client } = useWalletUi()
  return useQuery({
    retry: false,
    queryKey: ['get-account-info', mint],
    queryFn: async () => {
      const { data: tokenInfo } = await fetchMint(client.rpc, mint)
      return tokenInfo
    },
  })
}

export type PoolAccount = Account<Lilpool, string>
export function usePoolAccountsQuery() {
  const { client } = useWalletUi()
  const programId = useLildexProgramId()

  return useQuery({
    retry: false,
    queryKey: ['get-pool-accounts'],
    queryFn: async () => {
      const pools = (await getProgramAccountsDecoded(client.rpc, {
        decoder: getLilpoolDecoder(),
        filter: getBase58Decoder().decode(LILPOOL_DISCRIMINATOR),
        programAddress: LILDEX_PROGRAM_ADDRESS,
      })) as PoolAccount[]

      const results = []
      for (const { data: pool, address } of pools) {
        let metadataTokenA!: Extract<Extension, { __kind: 'TokenMetadata' }> & { decimals: number }
        let metadataTokenB!: Extract<Extension, { __kind: 'TokenMetadata' }> & { decimals: number }
        try {
          const { data: tokenAInfo } = await fetchMint(client.rpc, pool.tokenMintA)
          if (tokenAInfo.extensions.__option === 'Some') {
            const extensionTokenA = tokenAInfo.extensions.value.find((ext) => ext.__kind === 'TokenMetadata')
            metadataTokenA = {
              ...extensionTokenA!,
              decimals: tokenAInfo.decimals,
            }
          }

          const { data: tokenBInfo } = await fetchMint(client.rpc, pool.tokenMintB)
          if (tokenBInfo.extensions.__option === 'Some') {
            const extensionTokenB = tokenBInfo.extensions.value.find((ext) => ext.__kind === 'TokenMetadata')
            metadataTokenB = {
              ...extensionTokenB!,
              decimals: tokenBInfo.decimals,
            }
          }
        } catch (error) {
          const fallBackData: Extract<Extension, { __kind: 'TokenMetadata' }> & { decimals: number } = {
            __kind: 'TokenMetadata',
            updateAuthority: none(),
            mint: solanaTokenAddress,
            name: '',
            symbol: '',
            uri: '',
            additionalMetadata: new Map(),
            decimals: 1,
          }
          metadataTokenA = fallBackData
          metadataTokenB = fallBackData
        }
        results.push({
          ...pool,
          address,
          metadataTokenA,
          metadataTokenB,
        })
      }
      return results
    },
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
  const tokenABigIntAmount = numberToBigintPrice(Number(tokenAAmount), 9n)
  const tokenBBigIntAmount = numberToBigintPrice(Number(tokenBAmount), 9n)

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
