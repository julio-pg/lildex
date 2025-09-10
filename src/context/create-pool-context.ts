import { bigintPriceToNumber, numberToBigintPrice, TokenMetadata } from '@/lib/utils'
import { atom } from 'jotai'

export const createTokenADataAtom = atom<TokenMetadata>()
export const createTokenBDataAtom = atom<TokenMetadata>()
export const createInitialPriceAtom = atom('')
export const createAAmountAtom = atom('')

export const createBAmountAtom = atom(
  (get) => {
    const tokenA = get(createAAmountAtom)
    const tokenBInfo = get(createTokenBDataAtom)
    const decimals = BigInt(tokenBInfo?.decimals! || 1n)
    const poolPrice = get(createInitialPriceAtom)
    const priceBigInt = numberToBigintPrice(Number(poolPrice), decimals)
    const newTokenBValue = Number(tokenA) * bigintPriceToNumber(priceBigInt, decimals)
    return newTokenBValue.toString()
  },
  (get, set, newTokenB: string) => {
    if (newTokenB == '') return

    const poolPrice = get(createInitialPriceAtom)
    const tokenAInfo = get(createTokenADataAtom)
    const decimals = BigInt(tokenAInfo?.decimals! || 1n)
    const priceBigInt = numberToBigintPrice(Number(poolPrice), decimals)

    const newTokenAValue = Number(newTokenB) / bigintPriceToNumber(priceBigInt, decimals)
    set(createAAmountAtom, newTokenAValue.toString())
  },
)
export const isPairSelectedAtom = atom((get) => {
  const tokenAInfo = get(createTokenADataAtom)
  const tokenBInfo = get(createTokenBDataAtom)
  const tokenAAddress = tokenAInfo?.address
  const tokenBAddress = tokenBInfo?.address
  if (tokenAInfo && tokenBInfo != undefined && tokenAAddress != tokenBAddress) {
    return true
  } else {
    return false
  }
})
export const createAmountIsValidAtom = atom((get) => {
  const tokenAInfo = get(createTokenADataAtom)
  const tokenBInfo = get(createTokenBDataAtom)
  const tokenABalance = tokenAInfo?.balance!
  const tokenBBalance = tokenBInfo?.balance!
  const tokenA = get(createAAmountAtom)
  const tokenB = get(createBAmountAtom)
  const initialPrice = get(createInitialPriceAtom)

  if (Number(tokenB) <= 0 || Number(tokenA) <= 0 || Number(initialPrice) <= 0) {
    return false
  }
  if (tokenABalance < Number(tokenA) || tokenBBalance < Number(tokenB)) {
    return false
  }
  return true
})
