import { Extension } from 'gill/programs'

export type ExtensionMetadata = Extract<Extension, { __kind: 'TokenMetadata' }> & { decimals: number }
