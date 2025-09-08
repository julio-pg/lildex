import { bigintPriceToNumber } from '@/lib/utils'
import { Lilpool } from '@project/anchor'
import { atom } from 'jotai'

export const selectedPoolAtom = atom<Lilpool>()
export const createTokenADataAtom = atom()
export const createTokenBDataAtom = atom()
export const createInitialPriceAtom = atom('')
export const createAAmountAtom = atom('')

export const createBAmountAtom = atom(
  (get) => {
    const tokenA = get(createAAmountAtom)
    const poolPrice = get(createInitialPriceAtom) || 1n
    const newTokenBValue: number = Number(tokenA) * bigintPriceToNumber(BigInt(poolPrice), 9n)
    return newTokenBValue.toString()
  },
  (get, set, newTokenB: string) => {
    const pool = get(selectedPoolAtom)
    if (!pool?.price) return
    if (newTokenB == '') return

    const poolPrice = pool?.price || 1n
    // convert tokenB → tokenA
    const newTokenAValue = Number(newTokenB) / bigintPriceToNumber(poolPrice, 9n)
    set(createAAmountAtom, newTokenAValue.toString())
  },
)

// export const amountIsValidAtom = atom((get) => {
//   const tokenA = get(tokenAAmountAtom)
//   const tokenb = get(tokenBAmountAtom)
//   const pool = get(selectedPoolAtom)
//   const poolPrice = pool?.price || 1n
//   // console.log(Number(tokenb))
//   // console.log(Number(tokenA) * bigintPriceToNumber(poolPrice, 9n))
//   const isValid = Number(tokenb) == Number(tokenA) * bigintPriceToNumber(poolPrice, 9n)
//   return isValid
// })
