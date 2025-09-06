import { data } from 'react-router'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { usePositionAccountsQuery } from './portfolio-data-access'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '../solana/solana-provider'

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
          {postions?.map(({ data, address }) => (
            <TableRow key={address} className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <TableHead className=" font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl">
                {data.lilpool}
              </TableHead>
              <TableCell>{BigInt(data?.tokenAAmount || 0) / 10n ** BigInt(9)}</TableCell>
              <TableCell>{BigInt(data?.tokenBAmount || 0) / 10n ** BigInt(9)}</TableCell>
              {/* <TableCell >${data.positionMint / BigInt(10) ** BigInt(9)}</TableCell> */}
              <TableCell>
                <Button>Close</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
