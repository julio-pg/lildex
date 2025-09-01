import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Copy, ExternalLink } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useState } from 'react'
import { address } from 'gill'
import { useGetTokenAccountAddressQuery, useGetTokenBalanceQuery } from '../account/account-data-access'

export default function CreatePool() {
  const { account } = useWalletUi()
  const [poolTokens, setpoolTokens] = useState({
    tokenA: address('BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'),
    tokenB: address('So11111111111111111111111111111111111111112'),
  })
  const tokenAccountA = useGetTokenAccountAddressQuery({
    wallet: address(account?.address!),
    mint: poolTokens.tokenA,
    useTokenExtensions: false,
  })
  const tokenAccountB = useGetTokenAccountAddressQuery({
    wallet: address(account?.address!),
    mint: poolTokens.tokenB,
    useTokenExtensions: false,
  })
  const tokenBalanceA = useGetTokenBalanceQuery({ address: tokenAccountA.data! })
  const tokenBalanceB = useGetTokenBalanceQuery({ address: tokenAccountB.data! })

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
            <Input type="number" placeholder="0" className="placeholder:text-2xl" />

            <div className="text-slate-500 text-lg">{tokenBalanceA.data?.value.uiAmountString || 0}</div>
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
            <Input type="number" placeholder="0" className="placeholder:text-2xl" />
            <div className="text-slate-500 text-lg">{tokenBalanceB.data?.value.uiAmountString || 0}</div>
          </div>
          {/* Initial price */}

          <div>
            <h2 className="text-slate-400 text-sm font-medium">Initial Price</h2>

            <Input type="number" placeholder="0" className="placeholder:text-2xl" />
          </div>
        </div>

        {/* Connect Wallet Button */}
        <div className="flex w-full justify-center items-center">
          {account ? (
            <Button className="w-full bg-red-800 dark:text-neutral-400 font-bold text-xl" size="lg">
              Trade
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
