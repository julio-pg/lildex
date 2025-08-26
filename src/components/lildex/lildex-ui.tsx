import { ellipsify } from '@wallet-ui/react'
import {
  useLildexAccountsQuery,
  useLildexCloseMutation,
  useLildexDecrementMutation,
  useLildexIncrementMutation,
  useLildexInitializeMutation,
  useLildexProgram,
  useLildexProgramId,
  useLildexSetMutation,
} from './lildex-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExplorerLink } from '../cluster/cluster-ui'
import { LildexAccount } from '@project/anchor'
import { ReactNode } from 'react'

export function LildexProgramExplorerLink() {
  const programId = useLildexProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

export function LildexList() {
  const lildexAccountsQuery = useLildexAccountsQuery()

  if (lildexAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!lildexAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {lildexAccountsQuery.data?.map((lildex) => (
        <LildexCard key={lildex.address} lildex={lildex} />
      ))}
    </div>
  )
}

export function LildexProgramGuard({ children }: { children: ReactNode }) {
  const programAccountQuery = useLildexProgram()

  if (programAccountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!programAccountQuery.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return children
}

function LildexCard({ lildex }: { lildex: LildexAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lildex: {lildex.data.count}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink address={lildex.address} label={ellipsify(lildex.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <LildexButtonIncrement lildex={lildex} />
          <LildexButtonSet lildex={lildex} />
          <LildexButtonDecrement lildex={lildex} />
          <LildexButtonClose lildex={lildex} />
        </div>
      </CardContent>
    </Card>
  )
}

export function LildexButtonInitialize() {
  const mutationInitialize = useLildexInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Lildex {mutationInitialize.isPending && '...'}
    </Button>
  )
}

export function LildexButtonIncrement({ lildex }: { lildex: LildexAccount }) {
  const incrementMutation = useLildexIncrementMutation({ lildex })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}

export function LildexButtonSet({ lildex }: { lildex: LildexAccount }) {
  const setMutation = useLildexSetMutation({ lildex })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', lildex.data.count.toString() ?? '0')
        if (!value || parseInt(value) === lildex.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}

export function LildexButtonDecrement({ lildex }: { lildex: LildexAccount }) {
  const decrementMutation = useLildexDecrementMutation({ lildex })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}

export function LildexButtonClose({ lildex }: { lildex: LildexAccount }) {
  const closeMutation = useLildexCloseMutation({ lildex })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
