import { generateKeyPairSigner, KeyPairSigner } from 'gill'
import * as programClient from '../src/client/js/generated'
import { loadKeypairSignerFromFile } from 'gill/node'
import { Connection, connect } from 'solana-kite'
import { before, describe } from 'node:test'

// const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('lildex', () => {
  let connection: Connection
  let payer: KeyPairSigner
  let lildex: KeyPairSigner

  beforeAll(async () => {
    connection = await connect()
    lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile()

    console.log('Payer:', payer.address)
  })

  it('Initialize config Lildex', async () => {
    connection = await connect()

    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lil',
      payer.address,
    ])
    const config = configPDAAndBump.pda

    const whirpoolConfig = {
      config,
      funder: payer,
      feeAuthority: payer.address,
      defaultProtocolFeeRate: 1000, //10%
    }

    const ix = programClient.getInitializeConfigInstruction(whirpoolConfig)

    const signature = await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    // ASSERT
    const accounts = await programClient.fetchAllWhirlpoolsConfig(connection.rpc, [])
    console.log(accounts)
  })
})
