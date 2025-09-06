import { cn, getTokenBalance, solanaTokenAddress } from '@/lib/utils'
import { useWalletUi } from '@wallet-ui/react'
import { address, Address } from 'gill'
import { Wallet } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { useGetTokenInfoQuery } from '../account/account-data-access'
import { NumericFormat } from 'react-number-format'

type Props = {
  tokenAddress: Address
  tokenAmount: string
  setAmount: Dispatch<SetStateAction<string>>

  title?: string
}
export default function SwapInput({ tokenAddress, tokenAmount, setAmount, title }: Props) {
  const { account } = useWalletUi()
  const walletAddress = address(account?.address!) || solanaTokenAddress
  const { data: tokenInfo } = useGetTokenInfoQuery({
    tokenAddress: tokenAddress,
  })

  const tokenBalance = getTokenBalance(walletAddress, tokenAddress)

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
        <span className="h-5 inline-flex items-center whitespace-nowrap text-sm">$0.00</span>
      </div>
      <div className="space-y-2 flex flex-col items-end">
        {title && <span>Max</span>}
        <div className="flex px-2 py-1 gap-x-1.5 text-xl font-regular text-primary items-center">
          <img /> <span className="text-xl">{tokenInfo?.data.symbol || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-x-1.5">
          <span className="flex text-sm gap-x-1 items-center">
            <Wallet size={15} />
            <span>{Number(tokenBalance || 0).toFixed(3)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
