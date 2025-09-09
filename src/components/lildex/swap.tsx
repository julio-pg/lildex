import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Copy, ExternalLink } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Button } from '../ui/button'
import SwapInput from '../ui/swap-input'
import { solanaTokenAddress } from '@/lib/utils'
import { useState } from 'react'
import SwapInputWithModal from '../ui/swap-input-with-modal'

function Swap() {
  const { account } = useWalletUi()
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center justify-center">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* Pay and Receive Section */}
        <div className="flex flex-col items-center -space-y-3 mb-3">
          {/* Pay Section */}
          <SwapInputWithModal
            tokenAddress={solanaTokenAddress}
            tokenAmount={tokenAAmount}
            setAmount={setTokenAAmount}
            title="Pay"
          />

          {/* Swap Arrow */}
          <button className="items-center justify-center whitespace-nowrap rounded-full text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus disabled:cursor-not-allowed active:brightness-100 active:scale-[0.99] border border-glass shadow-down text-slate-50 duration-100 disabled:opacity-50 h-8 w-8 shrink-0 flex bg-dark-700/50 backdrop-blur-lg hover:brightness-125 disabled:text-tertiary">
            <ArrowUpDown className="w-4 h-4 text-slate-300" />
          </button>

          {/* Receive Section */}
          <SwapInputWithModal
            tokenAddress={solanaTokenAddress}
            tokenAmount={tokenBAmount}
            setAmount={setTokenBAmount}
            title="Receive"
          />
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
      {/* Token List */}
      <div className="space-y-4 w-full max-w-md">
        {/* SOL Token */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center space-x-3">
            <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">SOL</span>
                <span className="text-slate-400 text-sm">Solana</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Sol1...1112</span>
                <Copy className="w-3 h-3 text-slate-500" />
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">$194.92</div>
          </div>
        </div>

        {/* ORCA Token */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center space-x-3">
            <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">$LIL</span>
                <span className="text-slate-400 text-sm">Lil</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">orcA...kt2E</span>
                <Copy className="w-3 h-3 text-slate-500" />
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">$2.2165</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Swap
