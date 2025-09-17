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
import {
  getTokenMetadata,
  numberToBigintPrice,
  solanaTokenAddress,
  TokenMetadata,
  useGetTokenAccountAddress,
} from '@/lib/utils'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { ExtensionMetadata } from './pool-types'

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
  const signer = useWalletUiSigner()

  return useQuery({
    retry: false,
    queryKey: ['get-pool-accounts'],
    queryFn: async () => {
      const pools = (await getProgramAccountsDecoded(client.rpc, {
        decoder: getLilpoolDecoder(),
        filter: getBase58Decoder().decode(LILPOOL_DISCRIMINATOR),
        programAddress: programId,
      })) as PoolAccount[]

      const results = []
      for (const { data: pool, address } of pools) {
        let metadataTokenA!: TokenMetadata
        let metadataTokenB!: TokenMetadata
        try {
          const tokenAInfo = await getTokenMetadata(client.rpc, signer?.address, pool.tokenMintA)
          metadataTokenA = tokenAInfo
          const tokenBInfo = await getTokenMetadata(client.rpc, signer?.address, pool.tokenMintB)
          metadataTokenB = tokenBInfo
        } catch (error) {
          console.log(error)
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
  metadataTokenA,
  metadataTokenB,
  tokenAAmount,
  tokenBAmount,
}: {
  metadataTokenA: TokenMetadata
  metadataTokenB: TokenMetadata
  tokenAAmount: string
  tokenBAmount: string
}) {
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const programId = useLildexProgramId()
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)
  const tokenMintA = address(metadataTokenA?.address || solanaTokenAddress)
  const tokenMintB = address(metadataTokenB?.address || solanaTokenAddress)
  const tokenABigIntAmount = numberToBigintPrice(Number(tokenAAmount), BigInt(metadataTokenA?.decimals || 1))
  const tokenBBigIntAmount = numberToBigintPrice(Number(tokenBAmount), BigInt(metadataTokenB?.decimals || 1))

  return useMutation({
    retry: false,
    mutationFn: async () => {
      const postionTokenMint = await generateKeyPairSigner()
      const postionTokenAccount = await useGetTokenAccountAddress({
        wallet: address(signer.address || solanaTokenAddress),
        mint: address(postionTokenMint.address || solanaTokenAddress),
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
      const [lilpoolPda] = await getProgramDerivedAddress({
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
      const openPositionIx = getOpenPositionInstruction({
        funder: signer,
        owner: signer.address,
        positionMint: postionTokenMint,
        positionTokenAccount: postionTokenAccount,
        position: positionAddress,
        lilpool: lilpoolPda,
        tokenAAmount: tokenABigIntAmount,
        tokenBAmount: tokenBBigIntAmount,
        metadataUpdateAuth: signer.address,
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
      return signAndSend([openPositionIx, increaseLiquidityIx], signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, 'Postion Open with success')
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })
}
