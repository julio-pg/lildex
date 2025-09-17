import { bigintPriceToNumber, cn, ellipsify } from '@/lib/utils'
import { useOpenPositionMutation, usePoolAccountsQuery } from './pools-data-access'
import { Button, buttonVariants } from '../ui/button'
import SwapInput from '../ui/swap-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '../solana/solana-provider'
import { useAtom } from 'jotai'
import { amountIsValidAtom, poolAAmountAtom, poolBAmountAtom, selectedPoolAtom } from '@/context/lilpool-context'
import { Dispatch, SetStateAction } from 'react'

export default function Pools() {
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
  const { data: pools } = usePoolAccountsQuery()

  const [tokenAAmount, setTokenAAmount] = useAtom(poolAAmountAtom)
  const [tokenBAmount, setTokenBAmount] = useAtom(poolBAmountAtom)
  const [selectedPool, SetSelectedPool] = useAtom(selectedPoolAtom)

  const mutation = useOpenPositionMutation({
    selectedPool: selectedPool!,
    metadataTokenA: selectedPool?.metadataTokenA!,
    metadataTokenB: selectedPool?.metadataTokenB!,
    tokenAAmount,
    tokenBAmount,
  })
  const [amountIsValid] = useAtom(amountIsValidAtom)

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
          {pools?.map((data) => (
            <TableRow key={data.address} className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <TableHead scope="row" className=" font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl">
                {`${data.metadataTokenA.symbol || ellipsify(data.tokenMintA)} / ${ellipsify(data.metadataTokenB.symbol || data.tokenMintB)}`}
              </TableHead>
              <TableCell>${BigInt(bigintPriceToNumber(data?.price!, 9n) || 0)}</TableCell>
              <TableCell>{data.liquidity}</TableCell>
              <TableCell>{data.protocolFeeRate / 100}%</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={mutation.isPending} variant="outline" onClick={() => SetSelectedPool(data)}>
                      Open
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Open Position</DialogTitle>
                    </DialogHeader>
                    <SwapInput
                      tokenData={selectedPool?.metadataTokenA!}
                      tokenAmount={tokenAAmount}
                      setAmount={setTokenAAmount}
                    />
                    <SwapInput
                      tokenData={selectedPool?.metadataTokenB!}
                      tokenAmount={tokenBAmount}
                      setAmount={setTokenBAmount as Dispatch<SetStateAction<string>>}
                    />
                    <DialogClose
                      onClick={() => {
                        mutation
                          .mutateAsync()
                          .catch((err: any) => console.log(err))
                          .finally(() => {
                            setTokenAAmount('')
                            setTokenBAmount('')
                            SetSelectedPool(undefined)
                          })
                      }}
                      className={cn(buttonVariants())}
                      disabled={!amountIsValid}
                    >
                      Deposit
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
