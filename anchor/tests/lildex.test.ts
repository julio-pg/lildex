import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchLildex,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('lildex', () => {
  let payer: KeyPairSigner
  let lildex: KeyPairSigner

  beforeAll(async () => {
    lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Lildex', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, lildex: lildex })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentLildex = await fetchLildex(rpc, lildex.address)
    expect(currentLildex.data.count).toEqual(0)
  })

  it('Increment Lildex', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      lildex: lildex.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchLildex(rpc, lildex.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Lildex Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ lildex: lildex.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchLildex(rpc, lildex.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Lildex', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      lildex: lildex.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchLildex(rpc, lildex.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set lildex value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ lildex: lildex.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchLildex(rpc, lildex.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the lildex account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      lildex: lildex.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchLildex(rpc, lildex.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${lildex.address}`)
    }
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
