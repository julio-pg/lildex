import { bigintPriceToNumber } from '@/lib/utils'
import { Lilpool } from '@project/anchor'
import { atom } from 'jotai'

export const selectedPoolAtom = atom<Lilpool>()
export const tokenAAmountAtom = atom('')
// export const tokenBAmountAtom = atom('')
export const tokenBAmountAtom = atom(
  (get) => {
    const tokenA = get(tokenAAmountAtom)
    const pool = get(selectedPoolAtom)
    const poolPrice = pool?.price || 1n
    const newTokenABValue = Number(tokenA) * bigintPriceToNumber(poolPrice, 9n)
    return newTokenABValue.toString()
  },
  (get, set, newTokenB: string) => {
    const pool = get(selectedPoolAtom)
    if (!pool?.price) return
    const poolPrice = pool?.price || 1n
    // convert tokenB → tokenA
    const newTokenAValue = Number(newTokenB) / bigintPriceToNumber(poolPrice, 9n)
    set(tokenAAmountAtom, newTokenAValue.toString())
  },
)
