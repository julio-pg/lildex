import { useWalletUi } from '@wallet-ui/react'
import { DropletsIcon } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dispatch, SetStateAction } from 'react'
import { address } from 'gill'

import { solanaTokenAddress } from '@/lib/utils'
import { useInitializePoolMutation } from './create-pool-data-access'
import { useAtom } from 'jotai'
import {
  createAAmountAtom,
  createBAmountAtom,
  createInitialPriceAtom,
  createTokenADataAtom,
  createTokenBDataAtom,
  isPairSelectedAtom,
} from '@/context/create-pool-context'
import SwapInputWithModal from '../ui/swap-input-with-modal'
import { useGetListedTokensQuery } from '../lildex/swap-data-access'
import listedTokens from '@/lib/listed-tokens.json'
import { amountIsValidAtom } from '@/context/lilpool-context'

export default function CreatePool() {
  const { account } = useWalletUi()
  // const [searchParams, setSearchParams] = useSearchParams()
  if (!account) {
    return (
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    )
  }
  const [initialPrice, setInitialPrice] = useAtom(createInitialPriceAtom)
  const [tokenAAmount, setTokenAAmount] = useAtom(createAAmountAtom)
  const [tokenBAmount, setTokenBAmount] = useAtom(createBAmountAtom)
  const [selectedAtoken, setSelectedAtoken] = useAtom(createTokenADataAtom)
  const [selectedBtoken, setSelectedBtoken] = useAtom(createTokenBDataAtom)
  const [isPairSelected] = useAtom(isPairSelectedAtom)
  const [amountIsValid] = useAtom(amountIsValidAtom)
  const walletAddress = address(account?.address! || solanaTokenAddress)

  const { data: tokensWithBalances } = useGetListedTokensQuery({
    wallet: walletAddress,
    listedTokens: listedTokens,
  })

  const mutation = useInitializePoolMutation({
    tokenMintA: address(selectedAtoken?.address! || solanaTokenAddress),
    tokenMintB: address(selectedBtoken?.address! || solanaTokenAddress),
    tokenAAmount,
    tokenBAmount,
    initialPrice,
  })

  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center">
      <div className="flex items-center gap-x-2 font-medium text-2xl text-slate-50">
        <span>Create LilPool</span> <DropletsIcon />
      </div>
      <div className="w-full max-w-md rounded-2xl p-6  shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* token selection section*/}
        <div className="space-y-3 mb-8">
          {/* token A section */}
          <SwapInputWithModal
            tokenAmount={tokenAAmount}
            setAmount={setTokenAAmount}
            selectedToken={selectedAtoken!}
            setSelectedToken={setSelectedAtoken}
            listedTokens={tokensWithBalances!}
            title="Pay"
          />

          {/* token b Section */}
          <SwapInputWithModal
            tokenAmount={tokenBAmount}
            setAmount={setTokenBAmount as Dispatch<SetStateAction<string>>}
            selectedToken={selectedBtoken!}
            setSelectedToken={setSelectedBtoken}
            listedTokens={tokensWithBalances!}
            title="Pay"
          />
          {/* Initial price */}

          <div className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 rounded-full space-y-3">
            <h2 className="text-slate-400 text-xl font-medium">Initial Price</h2>

            <Input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              className="text-2xl"
            />
          </div>
        </div>

        {/* Connect Wallet Button */}
        <div className="flex w-full justify-center items-center">
          {account ? (
            <Button
              disabled={!(isPairSelected && amountIsValid)}
              className="w-full bg-red-800 hover:bg-red-800/75 dark:text-neutral-400 font-bold text-xl"
              size="lg"
              onClick={() => mutation.mutateAsync().catch((err) => console.log(err))}
            >
              Create
            </Button>
          ) : (
            <div style={{ display: 'inline-block' }}>
              <WalletButton />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
