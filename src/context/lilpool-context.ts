import { bigintPriceToNumber } from '@/lib/utils'
import { Lilpool } from '@project/anchor'
import { atom } from 'jotai'

export const selectedPoolAtom = atom<Lilpool>()
export const tokenAAmountAtom = atom('')

export const tokenBAmountAtom = atom(
  (get) => {
    const tokenA = get(tokenAAmountAtom)
    const pool = get(selectedPoolAtom)
    const poolPrice = pool?.price || 1n
    const newTokenBValue: number = Number(tokenA) * bigintPriceToNumber(poolPrice, 9n)
    return newTokenBValue.toString()
  },
  (get, set, newTokenB: string) => {
    const pool = get(selectedPoolAtom)
    if (!pool?.price) return
    if (newTokenB == '') return

    const poolPrice = pool?.price || 1n
    // convert tokenB → tokenA
    const newTokenAValue = Number(newTokenB) / bigintPriceToNumber(poolPrice, 9n)
    set(tokenAAmountAtom, newTokenAValue.toString())
  },
)

export const amountIsValidAtom = atom((get) => {
  const tokenA = get(tokenAAmountAtom)
  const tokenb = get(tokenBAmountAtom)
  const pool = get(selectedPoolAtom)
  const poolPrice = pool?.price || 1n
  // console.log(Number(tokenb))
  // console.log(Number(tokenA) * bigintPriceToNumber(poolPrice, 9n))
  const isValid = Number(tokenb) == Number(tokenA) * bigintPriceToNumber(poolPrice, 9n)
  return isValid
})
