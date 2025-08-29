import {
  Address,
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import { getInitializeConfigInstruction, InitializeConfigInput } from '../src'
import { loadKeypairSignerFromFile } from 'gill/node'
import { config } from 'process'
import { getProgramAccounts } from 'anchor/src/helpers/get-program-accounts'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('lildex', () => {
  let payer: KeyPairSigner
  let lildex: KeyPairSigner

  beforeAll(async () => {
    lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize config Lildex', async () => {
    const whirpoolConfig = {
      config: lildex.address,
      funder: payer.keyPair,
      feeAuthority: payer.keyPair,
      collectProtocolFeesAuthority: payer.keyPair,
      rewardEmissionsSuperAuthority: payer.keyPair,
      defaultProtocolFeeRate: 1000, //10%
    }

    const ix = getInitializeConfigInstruction(whirpoolConfig)

    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentLildex = await getProgramAccounts(rpc, { filter: '', programAddress: lildex.address })
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
