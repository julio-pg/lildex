import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Copy, Droplet, DropletsIcon, ExternalLink } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
import { address } from 'gill'

import { getTokenBalance, solanaTokenAddress } from '@/lib/utils'
import { useSearchParams } from 'react-router'
import { useInitializePoolMutation } from './create-pool-data-access'
import SwapInput from '../ui/swap-input'
import { useAtom } from 'jotai'
import { createAAmountAtom, createBAmountAtom, createInitialPriceAtom } from '@/context/create-pool-context'

export default function CreatePool() {
  const { account } = useWalletUi()
  const [searchParams, setSearchParams] = useSearchParams()
  // useEffect(() => {
  //   if (!searchParams.get('tokenA') || !searchParams.get('tokenB')) {
  //     setSearchParams({
  //       tokenA: 'So11111111111111111111111111111111111111112',
  //       tokenB: 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k',
  //     })
  //   }
  //   return () => {}
  // }, [setSearchParams])
  const [initialPrice, setInitialPrice] = useAtom(createInitialPriceAtom)
  const [tokenAAmount, setTokenAAmount] = useAtom(createAAmountAtom)
  const [tokenBAmount, setTokenBAmount] = useAtom(createBAmountAtom)

  // const tokenA = searchParams.get('tokenA') ?? solanaTokenAddress
  const tokenA = '9DYjjGwGXNmGcAE5RxJU4m7pTft6ZAjrjYE9g9VQc4zN'
  // const tokenB = searchParams.get('tokenB') ?? solanaTokenAddress
  const tokenB = '7jDq66vH7v28xQo6TNGsmaBBrsfqLC1HEXrix3a9pFzc'

  const mutation = useInitializePoolMutation({
    tokenMintA: address(tokenA),
    tokenMintB: address(tokenB),
    tokenAAmount,
    tokenBAmount,
    initialPrice,
  })

  // TODO: round the decimal to max 3 places
  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center gap-x-2 font-medium text-2xl text-slate-50">
        <span>Lil Pool</span> <DropletsIcon />
      </div>
      <div className="w-full max-w-md rounded-2xl p-6  shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* token selection section*/}
        <div className="space-y-3 mb-8">
          {/* token A section */}
          <SwapInput
            tokenAddress={solanaTokenAddress}
            tokenAmount={tokenAAmount}
            setAmount={setTokenAAmount}
            title="Pay"
          />

          {/* Receive Section */}
          <SwapInput
            tokenAddress={solanaTokenAddress}
            tokenAmount={tokenAAmount}
            setAmount={setTokenAAmount}
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
              className="w-full bg-red-800 dark:text-neutral-400 font-bold text-xl"
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
