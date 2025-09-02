import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Copy, ExternalLink } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
import { address } from 'gill'

import { getTokenBalance, solanaTokenAddress } from '@/lib/utils'
import { useSearchParams } from 'react-router'
import { useInitializePoolMutation } from './create-pool-data-access'

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
  const [initialPrice, setInitialPrice] = useState('0')
  const [tokenAAmount, setTokenAAmount] = useState('0')
  const [tokenBAmount, setTokenBAmount] = useState('0')

  // const tokenA = searchParams.get('tokenA') ?? solanaTokenAddress
  const tokenA = '9DYjjGwGXNmGcAE5RxJU4m7pTft6ZAjrjYE9g9VQc4zN'
  // const tokenB = searchParams.get('tokenB') ?? solanaTokenAddress
  const tokenB = '7jDq66vH7v28xQo6TNGsmaBBrsfqLC1HEXrix3a9pFzc'
  const wallletAddress = address(account?.address!) || solanaTokenAddress

  // get token balances
  const tokenBalanceA = getTokenBalance(wallletAddress, address(tokenA!), true)
  const tokenBalanceB = getTokenBalance(wallletAddress, address(tokenB!), true)

  const mutation = useInitializePoolMutation({
    tokenMintA: address(tokenA),
    tokenMintB: address(tokenB),
    tokenAAmount,
    tokenBAmount,
    initialPrice,
  })

  // TODO: round the decimal to max 3 places
  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center justify-center ">
      <div className="w-full max-w-md rounded-2xl p-6 border border-red-800 shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* token selection section*/}
        <div className="space-y-3 mb-8">
          {/* token A section */}
          <div className="space-y-2 bg-background p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-400 text-sm font-medium"></h2>
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 px-3 py-1 rounded-full">
                <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
                <span className="text-xs font-semibold">SOL</span>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0"
              className="placeholder:text-2xl"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(e.target.value!)}
            />

            <div className="text-slate-500 text-lg">{tokenBalanceA}</div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <div className="bg-red-700 p-2 rounded-full">
              <ArrowUpDown className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          {/* Receive Section */}
          <div className="space-y-2 bg-background p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-400 text-sm font-medium"></h2>
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 px-3 py-1 rounded-full">
                <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
                <span className="text-xs font-semibold">$LIL</span>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0"
              className="placeholder:text-2xl"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(e.target.value!)}
            />
            <div className="text-slate-500 text-lg">{tokenBalanceB}</div>
          </div>
          {/* Initial price */}

          <div className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 px-3 py-1 rounded-full">
            <h2 className="text-slate-400 text-sm font-medium">Initial Price</h2>

            <Input
              type="number"
              placeholder="0"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              className="placeholder:text-2xl"
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
