import { LildexAccount, getLildexProgramAccounts, getLildexProgramId } from '@project/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { generateKeyPairSigner } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

export function useLildexProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getLildexProgramId(cluster.id), [cluster])
}

export function useLildexProgram() {
  const { client, cluster } = useWalletUi()
  const programId = useLildexProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}

export function useLildexInitializeMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  // return useMutation({
  //   mutationFn: async () => {
  //     const lildex = await generateKeyPairSigner()
  //     return await signAndSend(getInitializeInstruction({ payer: signer, lildex }), signer)
  //   },
  //   onSuccess: async (tx) => {
  //     toastTx(tx)
  //     await queryClient.invalidateQueries({ queryKey: ['lildex', 'accounts', { cluster }] })
  //   },
  //   onError: () => toast.error('Failed to run program'),
  // })
}

// export function useLildexIncrementMutation({ lildex }: { lildex: LildexAccount }) {
//   const invalidateAccounts = useLildexAccountsInvalidate()
//   const signAndSend = useWalletTransactionSignAndSend()
//   const signer = useWalletUiSigner()

//   return useMutation({
//     mutationFn: async () => await signAndSend(getIncrementInstruction({ lildex: lildex.address }), signer),
//     onSuccess: async (tx) => {
//       toastTx(tx)
//       await invalidateAccounts()
//     },
//   })
// }

export function useLildexAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useLildexAccountsQueryKey(),
    queryFn: async () => await getLildexProgramAccounts(client.rpc),
  })
}

// function useLildexAccountsInvalidate() {
//   const queryClient = useQueryClient()
//   const queryKey = useLildexAccountsQueryKey()

//   return () => queryClient.invalidateQueries({ queryKey })
// }

function useLildexAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['lildex', 'accounts', { cluster }]
}
