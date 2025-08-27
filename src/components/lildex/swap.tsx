import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Copy, ExternalLink } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

function Swap() {
  const { account } = useWalletUi()

  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center justify-center ">
      <div className="w-full max-w-md rounded-2xl p-6 border border-red-800 shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* Pay and Receive Section */}
        <div className="space-y-3 mb-8">
          {/* Pay Section */}
          <div className="space-y-2 bg-background p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-400 text-sm font-medium">Pay</h2>
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 px-3 py-1 rounded-full">
                <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
                <span className="text-xs font-semibold">SOL</span>
              </div>
            </div>
            <Input type="number" placeholder="0" className="placeholder:text-2xl" />

            <div className="text-slate-500 text-lg">$0.00</div>
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
              <h2 className="text-slate-400 text-sm font-medium">Receive</h2>
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 px-3 py-1 rounded-full">
                <img className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" src="/img/lil-logo.png" />
                <span className="text-xs font-semibold">$LIL</span>
              </div>
            </div>
            <Input type="number" placeholder="0" className="placeholder:text-2xl" />
            <div className="text-slate-500 text-lg">$0.00</div>
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
