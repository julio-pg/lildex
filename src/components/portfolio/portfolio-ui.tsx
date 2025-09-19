import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useClosePositionMutation, usePositionAccountsQuery } from './portfolio-data-access'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '../solana/solana-provider'
import { bigintPriceToNumber, ellipsify } from '@/lib/utils'
import { useAtom } from 'jotai'
import { portSelectedPositionAtom } from '@/context/portfolio-context'

export default function Portfolio() {
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
  const { data: postions } = usePositionAccountsQuery()

  const [selectedPostion, SetSelectedPosition] = useAtom(portSelectedPositionAtom)
  const mutation = useClosePositionMutation({
    selectedPosition: selectedPostion!,
  })
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pool</TableHead>
          <TableHead>Balance token A</TableHead>
          <TableHead>Balance token B</TableHead>
          {/* <TableHead>Current Price</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {postions?.map((data) => (
          <TableRow key={data.address}>
            <TableHead scope="row" className="flex items-center">
              <div className="items-center -space-x-2 flex lg:group-hover:opacity-0">
                <span className="flex min-h-4 min-w-4 shrink-0 rounded-full shadow-box h-5 w-5">
                  <img className="aspect-square h-full w-full rounded-full" src={data.metadataTokenA.logoURI} />
                </span>
                <span className="flex min-h-4 min-w-4 shrink-0 rounded-full shadow-box h-5 w-5">
                  <img className="aspect-square h-full w-full rounded-full" src={data.metadataTokenB.logoURI} />
                </span>
                <span className="flex min-h-4 min-w-4 shrink-0 rounded-full shadow-box h-5 w-5"></span>
              </div>
              <span>{`${data.metadataTokenA.symbol || ellipsify(data.metadataTokenB.address)} / ${ellipsify(data.metadataTokenB.symbol || data.metadataTokenB.address)}`}</span>
            </TableHead>
            <TableCell>
              {bigintPriceToNumber(data?.tokenAAmount, BigInt(data.metadataTokenA.decimals || 1)) || 0}
            </TableCell>
            <TableCell>
              {bigintPriceToNumber(data?.tokenBAmount, BigInt(data?.metadataTokenB.decimals || 1)) || 0}
            </TableCell>
            {/* <TableCell >${data.positionMint / BigInt(10) ** BigInt(9)}</TableCell> */}
            <TableCell>
              <Button
                // disabled={mutation.isPending}
                onClick={() => {
                  SetSelectedPosition(data)
                  mutation.mutateAsync().catch((err) => console.log(err))
                }}
              >
                Close
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
