import { ellipsify } from '@/lib/utils'
import { usePoolAccountsQuery } from './pools-data-access'
import { Button } from '../ui/button'
import { AppModal } from '../app-modal'
import { useState } from 'react'
import SwapInput from '../ui/swap-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useOpenPositionMutation } from '../portfolio/portfolio-data-access'
import { Address } from 'gill'
import { DialogClose } from '../ui/dialog'

export default function Pools() {
  const { data: pools } = usePoolAccountsQuery()
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  const mutation = (tokenMintA: Address, tokenMintB: Address, tokenAAmount: string, tokenBAmount: string) =>
    useOpenPositionMutation({ tokenMintA, tokenMintB, tokenAAmount, tokenBAmount })
      .mutateAsync()
      .catch((err) => console.log(err))
  return (
    <div className="relative overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pool</TableHead>
            <TableHead>Price </TableHead>
            <TableHead>Liquitidy</TableHead>
            <TableHead>Fee Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools?.map(({ data, address }) => (
            <TableRow key={address} className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <TableHead scope="row" className=" font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl">
                {`${ellipsify(data.tokenMintA)} / ${ellipsify(data.tokenMintB)}`}
              </TableHead>
              <TableCell>${BigInt(data?.price || 0) / BigInt(10) ** BigInt(9)}</TableCell>
              <TableCell>{data.liquidity}</TableCell>
              <TableCell>{data.protocolFeeRate / 100}%</TableCell>
              <TableCell>
                <AppModal title="Open">
                  <SwapInput tokenAddress={data.tokenMintA} tokenAmount={tokenAAmount} setAmount={setTokenAAmount} />
                  <SwapInput tokenAddress={data.tokenMintB} tokenAmount={tokenBAmount} setAmount={setTokenBAmount} />
                  <DialogClose
                    onClick={() => {
                      setTokenAAmount('')
                      setTokenBAmount('')
                    }}
                  >
                    <Button
                      variant={'secondary'}
                      onClick={() => mutation(data.tokenMintA, data.tokenMintB, tokenAAmount, tokenBAmount)}
                    >
                      Deposit
                    </Button>
                  </DialogClose>
                </AppModal>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
