import { cn, ellipsify, TokenMetadata } from '@/lib/utils'
import { SetStateAction } from 'jotai'
import { Dispatch, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { Check, Copy, ExternalLink, Wallet } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from './dialog'
import { Button } from './button'

type Props = {
  tokenAmount: string
  setAmount: Dispatch<SetStateAction<string>>
  selectedToken: TokenMetadata
  setSelectedToken: Dispatch<SetStateAction<TokenMetadata | undefined>>
  listedTokens: TokenMetadata[]
  title?: string
}
export default function SwapInputWithModal({
  tokenAmount,
  setAmount,
  listedTokens,
  selectedToken,
  setSelectedToken,
  title,
}: Props) {
  return (
    <div
      className={cn(
        'flex grow w-full gap-2 px-3 py-3 min-h-24 inset-shadow-sm items-center justify-between group transition-all rounded-lg border focus-within:border-red-500  bg-gradient-to-b from-red-950/65 to-red-950/85 border-transparent ',
        title ? 'h-[7.5rem]' : 'h-24',
      )}
    >
      <div className="space-y-2 flex flex-col grow">
        {title && <span className="text-sm font-medium">{title}</span>}

        <NumericFormat
          placeholder="0"
          className="flex h-9 w-full bg-transparent transition disabled:cursor-not-allowed px-0 py-0 border-0 focus-visible:outline-none focus-visible:ring-0 text-ellipsis text-primary text-2xl"
          value={tokenAmount}
          decimalScale={3}
          onChange={(e) => setAmount(e.target.value)}
        />
        <span className="h-5 inline-flex items-center whitespace-nowrap text-sm">$1.00</span>
      </div>
      <div className="space-y-2 flex flex-col items-end">
        {title && <span>Max</span>}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex px-2 py-1 gap-x-1.5 text-xl font-regular text-primary items-center"
            >
              {selectedToken && (
                <img
                  src={selectedToken?.logoURI || '/img/fallback-coin.png'}
                  className="w-5 h-auto aspect-square rounded-full"
                />
              )}
              <span className="text-xl">
                {selectedToken?.symbol || ellipsify(selectedToken?.address, 2, '...') || 'Select Token'}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogTitle>Select a token</DialogTitle>
            {listedTokens?.map((data) => (
              <TokenRowData key={data.address} tokenData={data} setSelectedToken={setSelectedToken}></TokenRowData>
            ))}
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-x-1.5">
          <span className="flex text-sm gap-x-1 items-center">
            <Wallet size={15} />
            <NumericFormat displayType="text" value={selectedToken?.balance} decimalScale={3} />
          </span>
        </div>
      </div>
    </div>
  )
}

function TokenRowData({
  tokenData,
  setSelectedToken,
}: {
  tokenData: TokenMetadata
  setSelectedToken: Dispatch<SetStateAction<TokenMetadata | undefined>>
}) {
  const [textToCopy] = useState(tokenData?.address)
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
    <DialogClose
      onClick={() => setSelectedToken(tokenData)}
      className="flex select-none items-center rounded-sm py-1.5 text-sm outline-none hover:bg-red-700/30 transition duration-200 cursor-pointer px-6 gap-x-3 h-[4.25rem] w-full"
    >
      <div className="flex w-full gap-x-3 items-center font-regular">
        <span
          className="relative flex min-h-4 min-w-4 shrink-0 rounded-full shadow-box h-6 w-6"
          data-sentry-element="Avatar"
        >
          <img
            className="aspect-square h-full w-full rounded-full"
            data-sentry-element="AvatarImage"
            data-sentry-source-file="TokenAvatar.tsx"
            src={tokenData?.logoURI || '/img/fallback-coin.png'}
          />
        </span>
        <div className="flex flex-col mr-auto gap-y-0.5 min-w-0">
          <div className="flex gap-x-1.5 items-center min-w-0">
            <span className="font-medium text-base">{tokenData?.symbol || ellipsify(tokenData.address, 3, '...')}</span>
            <span className="text-sm text-primary/50 text-left overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
              {tokenData?.name}
            </span>
          </div>
          <div className="flex gap-x-1.5 items-center">
            <div className="px-2 flex gap-x-1.5 items-center justify-center whitespace-nowrap rounded border-none bg-red-400/20 text-button-link font-mono transition-all duration-100 focus-visible:outline-none disabled:cursor-not-allowed hover:brightness-125">
              <div
                className="flex gap-x-1 items-center h-5"
                data-sentry-element="CopyToClipboard"
                onClick={handleCopyClick}
              >
                {ellipsify(tokenData?.address, 4, '...')}
                {copySuccess ? <Check size={12} /> : <Copy size={12} />}
              </div>
              <div className="h-5 py-0.5">
                <div data-orientation="vertical" role="none" className="shrink-0 bg-red-300/10 h-full w-[1px]"></div>
              </div>
              <a
                href={`https://solscan.io/token/${tokenData?.address}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus disabled:cursor-not-allowed text-button-link disabled:text-tertiary hover:brightness-125 disabled:hover:brightness-100 active:brightness-150 duration-100 p-0 h-5"
                aria-disabled="false"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-xs text-right flex flex-col text-secondary">
          <NumericFormat
            displayType="text"
            value={tokenData?.balance}
            decimalScale={3}
            className="text-base font-medium text-primary"
          />
          <span className="" data-sentry-component="SimpleUSD" data-sentry-source-file="SimpleNumbers.tsx">
            $1
          </span>
        </div>
      </div>
    </DialogClose>
  )
}
