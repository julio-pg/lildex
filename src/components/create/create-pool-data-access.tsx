import { getInitializePoolInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletUiSigner } from '@wallet-ui/react'
import { address, Address, getAddressEncoder, getProgramDerivedAddress, getUtf8Encoder } from 'gill'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { toastTx } from '../toast-tx'
import { toast } from 'sonner'
import { useLildexProgramId } from '../lildex/lildex-data-access'
import { useGetTokenAccountAddressQuery } from '../account/account-data-access'

export function useInitializePoolMutation({
  tokenMintA,
  tokenMintB,
  initialPrice,
}: {
  tokenMintA: Address
  tokenMintB: Address
  initialPrice: number | bigint
}) {
  const signAndSend = useWalletTransactionSignAndSend()
  const addressEncoder = getAddressEncoder()
  const textEncoder = getUtf8Encoder()
  const signer = useWalletUiSigner()
  const programId = useLildexProgramId()
  const testWallet = address(import.meta.env.VITE_TEST_WALLET!)

  const tokenVaultA = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintA,
    useTokenExtensions: false,
  })
  const tokenVaultB = useGetTokenAccountAddressQuery({
    wallet: signer.address,
    mint: tokenMintB,
    useTokenExtensions: false,
  })
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
      return await signAndSend(
        getInitializePoolInstruction({
          lilpoolsConfig: configPda,
          tokenMintA: tokenMintA,
          tokenMintB: tokenMintB,
          funder: signer,
          lilpool: lilpollPda,
          tokenVaultA: tokenVaultA.data!,
          tokenVaultB: tokenVaultB.data!,
          initialPrice: initialPrice,
        }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx)
    },
    onError: (e) => toast.error(e.message),
  })
}
