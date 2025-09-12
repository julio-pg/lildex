import { data } from 'react-router'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useClosePositionMutation, usePositionAccountsQuery } from './portfolio-data-access'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '../solana/solana-provider'
import { Address } from 'gill'
import { ellipsify } from '@/lib/utils'
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
  const { data: postions } = usePositionAccountsQuery({ walletAddress: account.address })
  const [selectedPostion, SetSelectedPosition] = useAtom(portSelectedPositionAtom)
  const mutation = useClosePositionMutation({
    lilpoolAddress: selectedPostion?.data.lilpool!,
    positionAddress: selectedPostion?.address!,
    positionMint: selectedPostion?.data.positionMint!,
  })
  return (
    <div className="relative overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pool</TableHead>
            <TableHead>Balance token A</TableHead>
            <TableHead>Balance token B</TableHead>
            <TableHead>Current Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postions?.map((position) => (
            <TableRow key={position.address} className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <TableHead className=" font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl">
                {ellipsify(position.address)}
              </TableHead>
              <TableCell>{BigInt(position.data?.tokenAAmount || 0) / 10n ** BigInt(9)}</TableCell>
              <TableCell>{BigInt(position.data?.tokenBAmount || 0) / 10n ** BigInt(9)}</TableCell>
              {/* <TableCell >${data.positionMint / BigInt(10) ** BigInt(9)}</TableCell> */}
              <TableCell>
                <Button
                  onClick={() => {
                    SetSelectedPosition(position)
                    mutation.mutateAsync().catch((err: any) => console.log(err))
                  }}
                >
                  Close
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
