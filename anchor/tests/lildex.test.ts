import { Address, address, FixedSizeEncoder, generateKeyPairSigner, getAddressEncoder, KeyPairSigner } from 'gill'
import * as programClient from '../src/client/js/generated'
import { loadKeypairSignerFromFile } from 'gill/node'
import { Connection, connect } from 'solana-kite'
import { before, describe } from 'node:test'

// const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('lildex', () => {
  let connection: Connection
  let payer: KeyPairSigner
  let lildex: KeyPairSigner
  let postionTokenMint: Address
  let tokenMintA: Address
  let tokenMintB: Address
  let addressEncoder: FixedSizeEncoder<Address<string>, 32>
  beforeAll(async () => {
    connection = await connect()
    lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile()
    tokenMintA = address('So11111111111111111111111111111111111111112') //devSOL
    tokenMintB = address('BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k') //devUSDC
    addressEncoder = getAddressEncoder()

    // create position token mint
    postionTokenMint = await connection.createTokenMint({
      mintAuthority: payer,
      decimals: 0,
      name: 'Lil test',
      symbol: 'LIL_TEST',
      uri: 'https://example.com/token-a',
      additionalMetadata: {
        keyOne: 'valueOne',
        keyTwo: 'valueTwo',
      },
    })
  })

  it('Initialize config Lildex', async () => {
    connection = await connect()
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lil',
      payer.address,
    ])
    const configAccount = await programClient.fetchLilpoolsConfig(connection.rpc, configPDAAndBump.pda)

    if (configAccount) {
      console.log('Config already initialized')
      console.log('configAccount:', configAccount.address)
    } else {
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
      const configAccount = await programClient.fetchLilpoolsConfig(connection.rpc, configPDAAndBump.pda)
      console.log('configAccount:', configAccount.address)
    }
  })

  it('Initialize pool', async () => {
    connection = await connect()

    // get config PDA
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lil',
      payer.address,
    ])

    const configAddress = addressEncoder.encode(configPDAAndBump.pda) as Uint8Array
    // get lilpool PDA
    const lilpoolPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      addressEncoder.encode(tokenMintA) as Uint8Array,
      addressEncoder.encode(tokenMintB) as Uint8Array,
    ])
    const lilpoolAddress = lilpoolPDAAndBump.pda

    // get vault PDAs
    const tokenVaultA = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintA, true)
    const tokenVaultB = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintB, false)

    const ix = programClient.getInitializePoolInstruction({
      lilpoolsConfig: configPDAAndBump.pda,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      funder: payer,
      lilpool: lilpoolAddress,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      initialPrice: 10000,
    })

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    const poolAccount = await programClient.fetchLilpoolsConfig(connection.rpc, configPDAAndBump.pda)
    console.log('poolAccount:', poolAccount.address)
  })
  it('Open position', async () => {
    connection = await connect()
    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint, true)

    const positionPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint,
    ])
    const positionAddress = positionPDAAndBump.pda

    // get config PDA
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lil',
      payer.address,
    ])
    const configAddress = configPDAAndBump.pda

    const lilpoolPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      tokenMintA,
      tokenMintB,
    ])
    const lilpoolAddress = lilpoolPDAAndBump.pda

    const ix = programClient.getOpenPositionInstruction({
      funder: payer,
      owner: payer.address,
      positionMint: postionTokenMint,
      positionTokenAccount: postionTokenAccount,
      position: positionAddress,
      lilpool: lilpoolAddress,
    })

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    const accounts = await programClient.fetchAllPosition(connection.rpc, [])
    console.log(accounts)
  })
  it('Close position', async () => {
    connection = await connect()
    const positionPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint,
    ])
    const positionAddress = positionPDAAndBump.pda
    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint, true)

    const ix = programClient.getClosePositionInstruction({
      positionAuthority: payer,
      receiver: payer.address,
      position: positionAddress,
      positionMint: postionTokenMint,
      positionTokenAccount: postionTokenAccount,
    })

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })
    const accounts = await programClient.fetchAllPosition(connection.rpc, [])
    console.log(accounts)
  })
  it('Execute swap', async () => {
    connection = await connect()
  })
})
