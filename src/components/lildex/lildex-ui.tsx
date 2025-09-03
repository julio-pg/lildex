import { ellipsify } from '@wallet-ui/react'
import { useLildexProgram, useLildexProgramId } from './lildex-data-access'

import { ExplorerLink } from '../cluster/cluster-ui'
import { ReactNode } from 'react'

export function LildexProgramExplorerLink() {
  const programId = useLildexProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
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
