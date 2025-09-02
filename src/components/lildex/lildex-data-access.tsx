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

export function useLildexAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useLildexAccountsQueryKey(),
    queryFn: async () => await getLildexProgramAccounts(client.rpc),
  })
}

function useLildexAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['lildex', 'accounts', { cluster }]
}
