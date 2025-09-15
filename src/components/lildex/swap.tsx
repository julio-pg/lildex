import { useWalletUi } from '@wallet-ui/react'
import { ArrowUpDown, Check, CircleX, Copy, ExternalLink, X } from 'lucide-react'
import { WalletButton } from '../solana/solana-provider'
import { Button } from '../ui/button'
import { ellipsify, solanaTokenAddress } from '@/lib/utils'
import { Dispatch, SetStateAction, useState } from 'react'
import SwapInputWithModal from '../ui/swap-input-with-modal'
import { useCreateSwapMutation, useGetLilpoolAddressQuery, useGetListedTokensQuery } from './swap-data-access'
import { address } from 'gill'
import listedTokens from '@/lib/listed-tokens.json'
import { useAtom } from 'jotai'
import {
  selectedAtokenAtom,
  selectedBtokenAtom,
  swapSelectedPoolAtom,
  swapTokenAAmountAtom,
  swapTokenBAmountAtom,
} from '@/context/swap-context'
function Swap() {
  const { account } = useWalletUi()
  if (!account) {
    return (
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    )
  }
  const [selectedPool, SetSelectedPool] = useAtom(swapSelectedPoolAtom)
  const [tokenAAmount, setTokenAAmount] = useAtom(swapTokenAAmountAtom)
  const [tokenBAmount, setTokenBAmount] = useAtom(swapTokenBAmountAtom)
  const [selectedAtoken, setSelectedAtoken] = useAtom(selectedAtokenAtom)
  const [selectedBtoken, setSelectedBtoken] = useAtom(selectedBtokenAtom)
  const walletAddress = address(account?.address!) || solanaTokenAddress

  const { data: tokensWithBalances } = useGetListedTokensQuery({
    wallet: walletAddress,
    listedTokens: listedTokens,
  })
  const { data: lilpool } = useGetLilpoolAddressQuery({
    tokenMintA: selectedAtoken?.address!,
    tokenMintB: selectedBtoken?.address!,
  })
  SetSelectedPool(lilpool?.data)

  const mutation = useCreateSwapMutation({
    amountIn: tokenAAmount,
    amountOut: tokenBAmount,
    selectedAtoken: selectedAtoken!,
    selectedBtoken: selectedBtoken!,
    lilpoolData: lilpool!,
  })
  return (
    <div className="min-h-screen flex flex-col gap-y-4 items-center justify-center">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        {/* Pay and Receive Section */}
        <div className="flex flex-col items-center -space-y-3 mb-3">
          {/* Pay Section */}
          <SwapInputWithModal
            tokenAmount={tokenAAmount}
            setAmount={setTokenAAmount}
            selectedToken={selectedAtoken!}
            setSelectedToken={setSelectedAtoken}
            listedTokens={tokensWithBalances!}
            title="Pay"
          />

          {/* Swap Arrow */}
          <button
            className="items-center justify-center whitespace-nowrap rounded-full text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus disabled:cursor-not-allowed active:brightness-100 active:scale-[0.99] border border-glass shadow-down text-slate-50 duration-100 disabled:opacity-50 h-8 w-8 shrink-0 flex bg-dark-700/50 backdrop-blur-lg hover:brightness-125 disabled:text-tertiary"
            onClick={() => {
              setSelectedAtoken(selectedBtoken)
              setSelectedBtoken(selectedAtoken)
            }}
          >
            <ArrowUpDown className="w-4 h-4 text-slate-300" />
          </button>

          {/* Receive Section */}
          <SwapInputWithModal
            tokenAmount={tokenBAmount}
            setAmount={setTokenBAmount as Dispatch<SetStateAction<string>>}
            selectedToken={selectedBtoken!}
            setSelectedToken={setSelectedBtoken}
            listedTokens={tokensWithBalances!}
            title="Receive"
          />
        </div>

        {/* Connect Wallet Button */}
        <div className="flex flex-col gap-y-2 w-full justify-center items-center">
          {account ? (
            <Button
              onClick={() => mutation.mutateAsync().catch((e) => console.log(e))}
              disabled={!lilpool}
              className="w-full bg-red-800 hover:bg-red-800/75 dark:text-neutral-400 font-bold text-xl"
              size="lg"
            >
              Trade
            </Button>
          ) : (
            <div style={{ display: 'inline-block' }}>
              <WalletButton />
            </div>
          )}
          {account && !lilpool && (
            <div
              role="alert"
              className="items-start gap-x-2 flex relative w-full rounded-md py-2.5 px-3 border border-orange-400 text-sm text-orange-400"
            >
              <CircleX />
              <div className="flex flex-col gap-1">
                <h5 className="font-medium">Sorry, that token pair is not supported. Try a different combination.</h5>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Token List */}
      {selectedAtoken && selectedBtoken && (
        <div className="space-y-4 w-full max-w-md">
          {/* SOL Token */}
          <div className="flex items-center justify-between p-4 ">
            <div className="flex items-center space-x-3">
              <img
                className="w-8 h-8 rounded-full mr-2 flex items-center justify-center"
                src={selectedAtoken?.logoURI!}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{selectedAtoken?.symbol}</span>
                  <span className="text-slate-400 text-sm">{selectedAtoken?.name}</span>
                </div>
                <AddressLink address={selectedAtoken?.address!} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">$1</div>
            </div>
          </div>

          {/* ORCA Token */}
          <div className="flex items-center justify-between p-4 ">
            <div className="flex items-center space-x-3">
              <img
                className="w-8 h-8 rounded-full mr-2 flex items-center justify-center"
                src={selectedBtoken?.logoURI!}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{selectedBtoken?.symbol}</span>
                  <span className="text-slate-400 text-sm">{selectedBtoken?.name}</span>
                </div>
                <AddressLink address={selectedBtoken?.address!} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">$1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Swap

function AddressLink({ address }: { address: string }) {
  const [textToCopy] = useState(address)
  const [copySuccess, setCopySuccess] = useState('')

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopySuccess('Copied!')
      setTimeout(() => setCopySuccess(''), 2000) // Clear success message after 2 seconds
    } catch (err) {
      setCopySuccess('Failed to copy!')
      console.error('Failed to copy text: ', err)
    }
  }
  return (
    <div className="flex gap-x-1.5 items-center">
      <div className="px-2 flex gap-x-1.5 items-center justify-center whitespace-nowrap rounded border-none bg-red-400/20 text-button-link font-mono transition-all duration-100 focus-visible:outline-none disabled:cursor-not-allowed hover:brightness-125">
        <button
          className="flex gap-x-1 items-center h-5"
          data-sentry-element="CopyToClipboard"
          onClick={handleCopyClick}
        >
          {ellipsify(address, 4, '...')}
          {copySuccess ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <div className="h-5 py-0.5">
          <div data-orientation="vertical" role="none" className="shrink-0 bg-red-300/10 h-full w-[1px]"></div>
        </div>
        <a
          href={`https://solscan.io/token/${address}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus disabled:cursor-not-allowed text-button-link disabled:text-tertiary hover:brightness-125 disabled:hover:brightness-100 active:brightness-150 duration-100 p-0 h-5"
          aria-disabled="false"
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}
