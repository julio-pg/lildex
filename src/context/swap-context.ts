import { bigintPriceToNumber, numberToBigintPrice, TokenMetadata } from '@/lib/utils'
import { Lilpool } from '@project/anchor'
import { atom } from 'jotai'

export const swapSelectedPoolAtom = atom<Lilpool>()
export const selectedAtokenAtom = atom<TokenMetadata>()
export const selectedBtokenAtom = atom<TokenMetadata>()
export const swapTokenAAmountAtom = atom('')
export const swapTokenBAmountAtom = atom(
  (get) => {
    const tokenA = get(swapTokenAAmountAtom)
    const tokenAInfo = get(selectedAtokenAtom)
    const pool = get(swapSelectedPoolAtom)
    const tokenAdecimals = BigInt(tokenAInfo?.decimals! || 1n)

    const tokenARaw = numberToBigintPrice(Number(tokenA), tokenAdecimals)
    const poolPrice = pool?.price || 1n

    const tokenBRaw = (tokenARaw * poolPrice) / BigInt(10 ** 9)
    const newTokenBValue = bigintPriceToNumber(tokenBRaw, tokenAdecimals)
    return newTokenBValue.toString()
  },
  (get, set, newTokenB: string) => {
    if (newTokenB == '') return
    const pool = get(swapSelectedPoolAtom)

    const tokenBInfo = get(selectedBtokenAtom)
    const tokenBdecimals = BigInt(tokenBInfo?.decimals || 1n)
    const tokenBRaw = numberToBigintPrice(Number(newTokenB), tokenBdecimals)

    const poolPrice = pool?.price || 1n

    const tokenARaw = (tokenBRaw * BigInt(10 ** 9)) / poolPrice

    const newTokenAValue = bigintPriceToNumber(tokenARaw, tokenBdecimals)
    set(swapTokenAAmountAtom, newTokenAValue.toString())
  },
)

export const swapAmountIsValidAtom = atom((get) => {
  const tokenA = get(swapTokenAAmountAtom)
  const tokenB = get(swapTokenBAmountAtom)
  const selectedA = get(selectedAtokenAtom)
  const selectedB = get(selectedBtokenAtom)
  const tokenABalance = selectedA?.balance!
  // const tokenBBalance = selectedB?.balance!

  if (Number(tokenB) <= 0 || Number(tokenA) <= 0) {
    return false
  }
  if (tokenABalance < Number(tokenA)) {
    return false
  }
  return true
})
