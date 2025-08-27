import { LildexProgramGuard } from './lildex-ui'
import { useWalletUi } from '@wallet-ui/react'
import Swap from './swap'

export default function LildexFeature() {
  const { account } = useWalletUi()

  return (
    <LildexProgramGuard>
      <Swap />
    </LildexProgramGuard>
  )
}
