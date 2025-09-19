import { type ClassValue, clsx } from 'clsx'
import { address, Address, isSome, Lamports, lamportsToSol, SolanaClient } from 'gill'
import { twMerge } from 'tailwind-merge'
import {
  fetchMint,
  findAssociatedTokenPda,
  isExtension,
  TOKEN_2022_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from 'gill/programs/token'
import { fetchMetadata, getTokenMetadataAddress } from 'gill/programs'

export const solanaTokenAddress = address('So11111111111111111111111111111111111111112')
export const initialPriceDecimals = 9n

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
export async function getTokenBalance(rpc: SolanaClient['rpc'], wallet: Address, mint: Address, tokenProgram: Address) {
  let tokenBalance: string = '0'
  try {
    if (mint.toString() === solanaTokenAddress.toString()) {
      const balanceLamp = await rpc.getBalance(wallet).send()
      tokenBalance = lamportsToSol(balanceLamp?.value as Lamports)
    } else {
      const [tokenAccount] = await findAssociatedTokenPda({
        mint: mint,
        owner: wallet,
        tokenProgram,
      })
      const { value: balanceData } = await rpc.getTokenAccountBalance(tokenAccount).send()
      tokenBalance = balanceData.uiAmountString
    }
  } catch (error) {
    console.warn(error)
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
  tokenProgram?: string
}

export async function getUserListedTokens(rpc: SolanaClient['rpc'], wallet: Address, listedTokens: TokenMetadata[]) {
  const results = []
  for (const token of listedTokens) {
    let balance = 0
    let tokenProgram = ''
    const mint = address(token.address)
    try {
      if (mint == solanaTokenAddress) {
        const balanceString = await getTokenBalance(rpc, wallet, mint, TOKEN_PROGRAM_ADDRESS)
        balance = Number(balanceString)
        tokenProgram = TOKEN_PROGRAM_ADDRESS
      } else {
        const { value: tokenInfo } = await rpc.getAccountInfo(mint, { encoding: 'base64' }).send()

        const balanceString = await getTokenBalance(rpc, wallet, mint, tokenInfo?.owner!)
        balance = Number(balanceString)
        tokenProgram = tokenInfo?.owner!
      }
    } catch (err) {
      // User may not have an ATA or balance
      balance = 0
      tokenProgram = TOKEN_PROGRAM_ADDRESS
    }

    results.push({
      ...token,
      balance,
      tokenProgram,
    })
  }
  return results
}

export async function getTokenMetadata(
  rpc: SolanaClient['rpc'],
  wallet: Address,
  mint: Address,
): Promise<TokenMetadata> {
  const metadata: TokenMetadata = {
    address: '',
    symbol: '',
    name: '',
    decimals: 1,
    logoURI: '/img/fallback-coin.png',
    balance: 0,
    tokenProgram: '',
  }
  metadata.address = mint
  try {
    const mintAccount = await fetchMint(rpc, mint)
    if (mintAccount.programAddress == TOKEN_PROGRAM_ADDRESS) {
      const metadataAddress = await getTokenMetadataAddress(mint)
      const { data: metaplexMetadata } = await fetchMetadata(rpc, metadataAddress)
      try {
        const uriData = await (await fetch(metaplexMetadata?.data.uri!)).json()
        metadata.logoURI = uriData.image
      } catch (error) {
        console.warn('Metadata fetch failed:', error)
      }
      metadata.symbol = metaplexMetadata.data.symbol
      metadata.name = metaplexMetadata.data.name
    }

    const maybeTokenExtensions = mintAccount.data.extensions
    if (isSome(maybeTokenExtensions)) {
      const tokenExtensions = maybeTokenExtensions.value
      const TokenMetadata = tokenExtensions.find((extension) => isExtension('TokenMetadata', extension))
      try {
        const uriData = await (await fetch(TokenMetadata?.uri!)).json()

        metadata.logoURI = uriData.image
      } catch (error) {
        console.warn('Metadata fetch failed:', error)
      }
      metadata.symbol = TokenMetadata?.symbol!
      metadata.name = TokenMetadata?.name!
    }
    const balanceQuery = await getTokenBalance(rpc, wallet, mint, mintAccount.programAddress!)
    // assign values
    metadata.decimals = mintAccount?.data.decimals

    metadata.balance = Number(balanceQuery)
    metadata.tokenProgram = mintAccount.programAddress
  } catch (error) {
    console.log(error)
  }
  return metadata
}
