import { Address, address, FixedSizeEncoder, getAddressEncoder, KeyPairSigner } from 'gill'
import * as programClient from '../src/client/js/generated'
import { loadKeypairSignerFromFile } from 'gill/node'
import { Connection, TOKEN_EXTENSIONS_PROGRAM, connect } from 'solana-kite'
// const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('lildex', () => {
  let connection: Connection
  let payer: KeyPairSigner
  // let lildex: KeyPairSigner
  let postionTokenMint: Address
  let tokenMintA: Address
  let tokenMintB: Address
  let addressEncoder: FixedSizeEncoder<Address<string>, 32>
  const tokenDecimals = 9
  let funderTokenAccountA: Address
  let funderTokenAccountB: Address

  // Both tokens have 9 decimals, so we can use this to convert between major and minor units
  const TOKEN = 10n ** BigInt(tokenDecimals)
  const userInitialTokenAmount = 10n * TOKEN
  const tokenAOfferedAmount = 1n * TOKEN
  const tokenBWantedAmount = 1n * TOKEN
  const initialPrice = 3n * TOKEN

  beforeAll(async () => {
    connection = await connect()
    // lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile()
    // Create two token mints - the factories that create token A, and token B
    // tokenMintA = await connection.createTokenMint({
    //   mintAuthority: payer,
    //   decimals: tokenDecimals,
    //   name: 'Token A',
    //   symbol: 'TOKEN_A',
    //   uri: 'https://example.com/token-a',
    //   additionalMetadata: {
    //     keyOne: 'valueOne',
    //     keyTwo: 'valueTwo',
    //   },
    // })
    tokenMintA = address('9DYjjGwGXNmGcAE5RxJU4m7pTft6ZAjrjYE9g9VQc4zN')
    // tokenMintB = await connection.createTokenMint({
    //   mintAuthority: payer,
    //   decimals: tokenDecimals,
    //   name: 'Token B',
    //   symbol: 'TOKEN_B',
    //   uri: 'https://example.com/token-b',
    //   additionalMetadata: {
    //     keyOne: 'valueOne',
    //     keyTwo: 'valueTwo',
    //   },
    // })
    tokenMintB = address('7jDq66vH7v28xQo6TNGsmaBBrsfqLC1HEXrix3a9pFzc')
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
    // Mint tokens to the user
    // await connection.mintTokens(tokenMintA, payer, userInitialTokenAmount, payer.address)
    // await connection.mintTokens(tokenMintB, payer, userInitialTokenAmount, payer.address)
    // get funder token accounts
    funderTokenAccountA = await connection.getTokenAccountAddress(payer.address, tokenMintA, true)
    funderTokenAccountB = await connection.getTokenAccountAddress(payer.address, tokenMintB, true)
  })

  it('Initialize config Lildex', async () => {
    connection = await connect()
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'config',
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
      'config',
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
    const tokenVaultB = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintB, true)

    const ix = programClient.getInitializePoolInstruction({
      lilpoolsConfig: configPDAAndBump.pda,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      funder: payer,
      lilpool: lilpoolAddress,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      funderTokenAccountA: funderTokenAccountA,
      funderTokenAccountB: funderTokenAccountB,
      initialPrice: initialPrice,
      tokenAAmount: tokenAOfferedAmount,
      tokenBAmount: tokenBWantedAmount,
      tokenProgram: TOKEN_EXTENSIONS_PROGRAM,
    })

    await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [ix],
    })

    const poolAccount = await programClient.fetchLilpool(connection.rpc, lilpoolAddress)
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
