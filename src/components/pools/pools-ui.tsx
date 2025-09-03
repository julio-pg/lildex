import { ellipsify } from '@/lib/utils'
import { usePoolAccountsQuery } from './pools-data-access'
import { Button } from '../ui/button'
import { AppModal } from '../app-modal'
import { useState } from 'react'
import SwapInput from '../ui/swap-input'
import { address } from 'gill'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

export default function Pools() {
  const { data } = usePoolAccountsQuery()
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  return (
    <div className="relative overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <tr>
            <th scope="col" className="px-6 py-3">
              Pool
            </th>
            <th scope="col" className="px-6 py-3">
              Price{' '}
            </th>
            <th scope="col" className="px-6 py-3">
              Liquitidy
            </th>
            <th scope="col" className="px-6 py-3">
              Fee Rate
            </th>
          </tr>
        </TableHeader>
        <TableBody>
          {data?.map(({ data }) => (
            <TableRow className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <TableHead
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl"
              >
                {`${ellipsify(data.tokenMintA)} / ${ellipsify(data.tokenMintB)}`}
              </TableHead>
              <TableCell className="px-6 py-4">${data.price / BigInt(10) ** BigInt(9)}</TableCell>
              <TableCell className="px-6 py-4">{data.liquidity}</TableCell>
              <TableCell className="px-6 py-4">{data.protocolFeeRate / 100}%</TableCell>
              <TableCell>
                <AppModal title="Open">
                  <SwapInput tokenAddress={data.tokenMintA} tokenAmount={tokenAAmount} setAmount={setTokenAAmount} />
                  <SwapInput tokenAddress={data.tokenMintB} tokenAmount={tokenBAmount} setAmount={setTokenBAmount} />
                  <Button variant={'secondary'}>Deposit</Button>
                </AppModal>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
