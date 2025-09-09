import {
  useGetBalanceQuery,
  useGetTokenBalanceQuery,
  useGetTokenAccountAddressQuery,
} from '@/components/account/account-data-access'
import { type ClassValue, clsx } from 'clsx'
import { address, Address, Lamports, lamportsToSol, SolanaClient } from 'gill'
import { twMerge } from 'tailwind-merge'
import { findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS } from 'gill/programs/token'

export const solanaTokenAddress = address('So11111111111111111111111111111111111111112')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
export function getTokenBalance(wallet: Address, mint: Address): string {
  let tokenBalance: string = '0'
  if (mint.toString() === solanaTokenAddress.toString()) {
    const balanceLamp = useGetBalanceQuery({
      address: wallet,
    })
    tokenBalance = lamportsToSol(balanceLamp.data?.value as Lamports)
  } else {
    const tokenAccount = useGetTokenAccountAddressQuery({
      wallet: wallet,
      mint: mint,
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

export function bigintPriceToNumber(price: bigint, decimals: bigint): number {
  const scale = 10n ** decimals
  return Number(price) / Number(scale)
}
export function numberToBigintPrice(value: number, decimals: bigint): bigint {
  const scale = 10n ** decimals
  return BigInt(Math.round(value * Number(scale)))
}

export type TokenMetadata = {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  balance?: number
}

export async function getUserListedTokens(client: SolanaClient, wallet: Address, listedTokens: TokenMetadata[]) {
  const results = []
  for (const token of listedTokens) {
    let balance = 0
    const mint = address(token.address)
    try {
      if (mint == solanaTokenAddress) {
        const { value: balanceLamp } = await client.rpc.getBalance(wallet).send()
        balance = Number(lamportsToSol(balanceLamp))
      } else {
        const { value: tokenInfo } = await client.rpc.getAccountInfo(mint).send()

        const [ata] = await findAssociatedTokenPda({
          mint: mint,
          owner: wallet,
          tokenProgram: tokenInfo?.owner!,
        })
        const { value: account } = await client.rpc.getTokenAccountBalance(ata).send()
        balance = Number(account.amount) / Math.pow(10, token.decimals)
      }
    } catch (err) {
      // User may not have an ATA or balance
      balance = 0
    }

    results.push({
      ...token,
      balance,
    })
  }
  return results
}
