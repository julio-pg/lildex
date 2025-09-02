import {
  useGetBalanceQuery,
  useGetTokenBalanceQuery,
  useGetTokenAccountAddressQuery,
} from '@/components/account/account-data-access'
import { type ClassValue, clsx } from 'clsx'
import { address, Address, Lamports, lamportsToSol } from 'gill'
import { twMerge } from 'tailwind-merge'
import { findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS } from 'gill/programs/token'

export const solanaTokenAddress = address('So11111111111111111111111111111111111111112')
export function getTokenBigInt(amount: number, tokenDecimals: number) {
  const token = BigInt(amount) ** BigInt(tokenDecimals)
  return token
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
export function getTokenBalance(wallet: Address, mint: Address, useTokenExtensions: boolean): string {
  let tokenBalance: string = '0'
  if (mint.toString() === solanaTokenAddress.toString()) {
    const balanceLamp = useGetBalanceQuery({
      address: wallet,
    })
    tokenBalance = lamportsToSol(balanceLamp.data?.value as Lamports)
  } else {
    // TODO: get the data of the token to determine if this useTokenExtensions
    const tokenAccount = useGetTokenAccountAddressQuery({
      wallet: wallet,
      mint: mint,
      useTokenExtensions: useTokenExtensions,
    })
    const { data } = useGetTokenBalanceQuery({ address: tokenAccount.data! })
    tokenBalance = data?.value.uiAmountString!
  }
  return tokenBalance
}

export async function useGetTokenAccountAddress({
  wallet,
  mint,
  useTokenExtensions = false,
}: {
  wallet: Address
  mint: Address
  useTokenExtensions: boolean
}) {
  const tokenProgram = useTokenExtensions ? TOKEN_2022_PROGRAM_ADDRESS : TOKEN_PROGRAM_ADDRESS
  const address = await findAssociatedTokenPda({
    mint: mint,
    owner: wallet,
    tokenProgram,
  }).then(([address]) => address ?? '')
  return address
}
