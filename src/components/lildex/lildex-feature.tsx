import { WalletButton } from '../solana/solana-provider'
import { LildexButtonInitialize, LildexList, LildexProgramExplorerLink, LildexProgramGuard } from './lildex-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function LildexFeature() {
  const { account } = useWalletUi()

  return (
    <LildexProgramGuard>
      <AppHero
        title="Lildex"
        subtitle={
          account
            ? "Initialize a new lildex onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <LildexProgramExplorerLink />
        </p>
        {account ? (
          <LildexButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletButton />
          </div>
        )}
      </AppHero>
      {account ? <LildexList /> : null}
    </LildexProgramGuard>
  )
}
