import { TokenMetadata } from '@/lib/utils'
import { Position } from '@project/anchor'
import { Address } from 'gill'
import { atom } from 'jotai'
export type parsedPostion = Position & { address: Address } & {
  metadataTokenA: TokenMetadata
} & { metadataTokenB: TokenMetadata }
export const portSelectedPositionAtom = atom<parsedPostion>()
