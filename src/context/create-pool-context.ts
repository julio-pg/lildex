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
  if (tokenAInfo && tokenBInfo != undefined) {
    return true
  } else {
    return false
  }
})
export const amountIsValidAtom = atom((get) => {
  const tokenA = get(createAAmountAtom)
  const tokenb = get(createBAmountAtom)
  const initialPrice = get(createInitialPriceAtom)

  if (
    Number(tokenb) &&
    Number(tokenA) &&
    Number(initialPrice) != 0 &&
    Number(tokenb) &&
    Number(tokenA) &&
    Number(initialPrice) >= 1
  ) {
    return true
  } else {
    false
  }
})
