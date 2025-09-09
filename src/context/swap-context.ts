import { TokenMetadata } from '@/lib/utils'
import { atom } from 'jotai'

export const selectedAtokenAtom = atom<TokenMetadata>()
export const selectedBtokenAtom = atom<TokenMetadata>()
export const swapTokenAAmountAtom = atom('')
export const swapTokenBAmountAtom = atom('')
