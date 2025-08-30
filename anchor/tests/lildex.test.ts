import { address, generateKeyPairSigner, KeyPairSigner } from 'gill'
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

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    // ASSERT
    const accounts = await programClient.fetchAllLilpoolsConfig(connection.rpc, [])
    console.log(accounts)
  })

  it('Initialize pool', async () => {
    connection = await connect()
    const tokenMintA = address('So11111111111111111111111111111111111111112')
    const tokenMintB = address('USDC111111111111111111111111111111111111111')

    // get config PDA
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lil',
      payer.address,
    ])
    const configAddress = configPDAAndBump.pda
    // get lilpool PDA
    const lilpoolPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      tokenMintA,
      tokenMintB,
    ])
    const lilpoolAddress = lilpoolPDAAndBump.pda

    // get vault PDAs
    const tokenVaultA = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintA, true)
    const tokenVaultB = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintA, true)

    const ix = programClient.getInitializePoolInstruction({
      lilpoolsConfig: configAddress,
      funder: payer,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      initialPrice: 100,
      lilpool: lilpoolAddress,
      tokenVaultA,
      tokenVaultB,
    })

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    const accounts = await programClient.fetchAllLilpool(connection.rpc, [])
    console.log(accounts)
  })
  it('Open position', async () => {
    connection = await connect()
  })
  it('Close position', async () => {
    connection = await connect()
  })
  it('Execute swap', async () => {
    connection = await connect()
  })
})
