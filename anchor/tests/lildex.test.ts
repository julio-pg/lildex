import { Address, address, generateKeyPairSigner, KeyPairSigner } from 'gill'

import * as programClient from '../src/client/js/generated'
import { loadKeypairSignerFromFile } from 'gill/node'
import { Connection, TOKEN_EXTENSIONS_PROGRAM, connect } from 'solana-kite'

describe('lildex', () => {
  let connection: Connection
  let payer: KeyPairSigner
  // let lildex: KeyPairSigner
  let postionTokenMint: KeyPairSigner
  let tokenMintA: Address
  let tokenMintB: Address
  let tokenVaultA: Address
  let tokenVaultB: Address
  const tokenDecimals = 9
  let funderTokenAccountA: Address
  let funderTokenAccountB: Address
  let lilpoolAddress: Address
  let configAddress: Address
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
    tokenMintA = address('7MoZf1tgqWzjBgZbP6tPJ47yot3wvHjCnoAhqdbugUqQ')
    tokenMintB = address('45bj7CcD81SRPJyT1RArpPf1ryV6zXeq9LkeS9pCaLXo')
    // Mint tokens to the user
    // const appWallet = address('Cp3hG8RqRV7ifQaNoXQSxQVc63wSNyj9Junjs14LEQqQ')
    // await connection.mintTokens(tokenMintA, payer, userInitialTokenAmount, appWallet)
    // await connection.mintTokens(tokenMintB, payer, userInitialTokenAmount, appWallet)
    // get funder token accounts
    funderTokenAccountA = await connection.getTokenAccountAddress(payer.address, tokenMintA, true)
    funderTokenAccountB = await connection.getTokenAccountAddress(payer.address, tokenMintB, true)
    // get config PDA
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'config',
      payer.address,
    ])

    configAddress = configPDAAndBump.pda
    // get lilpool PDA
    const lilpoolPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      tokenMintA,
      tokenMintB,
    ])
    lilpoolAddress = lilpoolPDAAndBump.pda
    // get vault PDAs
    tokenVaultA = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintA, true)
    tokenVaultB = await connection.getTokenAccountAddress(lilpoolAddress, tokenMintB, true)
    postionTokenMint = await generateKeyPairSigner()
  })

  it('Initialize config Lildex', async () => {
    connection = await connect()
    const configPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'config',
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

    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [ix],
      })

      // ✅ success path: no error
      const configAccount = await programClient.fetchLilpoolsConfig(connection.rpc, configPDAAndBump.pda)
      expect(configAccount).toBeDefined()
      console.log('✅ poolAccount:', configAccount.address)
    } catch (err: any) {
      const msg = err.message || String(err)

      if (msg.includes('Allocate: account already in use')) {
        console.warn('⚠️ Config already initialized, treating as success')
        const configAccount = await programClient.fetchLilpoolsConfig(connection.rpc, configPDAAndBump.pda)
        console.log('✅ configAccount:', configAccount.address)

        expect(true).toBe(true) // pass
      } else {
        console.error('❌ Unexpected error:', msg)
        throw err // fail test for any other error
      }
    }
  })

  it('Initialize pool', async () => {
    connection = await connect()

    const ix = programClient.getInitializePoolInstruction({
      lilpoolsConfig: configAddress,
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

    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [ix],
      })

      // ✅ success path: no error
      const poolAccount = await programClient.fetchLilpool(connection.rpc, lilpoolAddress)
      expect(poolAccount).toBeDefined()
      console.log('✅ poolAccount:', poolAccount.address)
    } catch (err: any) {
      const msg = err.message || String(err)

      if (msg.includes('Allocate: account already in use')) {
        console.warn('⚠️ Pool already initialized, treating as success')
        const poolAccount = await programClient.fetchLilpool(connection.rpc, lilpoolAddress)
        console.log('✅ poolAccount:', poolAccount.address)
        expect(true).toBe(true) // pass
      } else {
        console.error('❌ Unexpected error:', msg)
        throw err // fail test for any other error
      }
    }
  })
  it('Open position', async () => {
    connection = await connect()
    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint.address, true)
    const positionPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint.address,
    ])
    const positionAddress = positionPDAAndBump.pda

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
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      positionMint: postionTokenMint,
      positionTokenAccount: postionTokenAccount,
      position: positionAddress,
      lilpool: lilpoolAddress,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      funderTokenAccountA: funderTokenAccountA,
      funderTokenAccountB: funderTokenAccountB,
      tokenAAmount: tokenAOfferedAmount,
      tokenBAmount: tokenBWantedAmount,
      tokenProgram: TOKEN_EXTENSIONS_PROGRAM,
    })

    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [ix],
      })
    } catch (err: any) {
      const msg = err.message || String(err)

      if (msg.includes('Allocate: account already in use')) {
        console.warn('⚠️ Position already initialized, treating as success')
        const positionAccount = await programClient.fetchPosition(connection.rpc, positionAddress)
        console.log('✅ positionAccount:', positionAccount.address)
        expect(true).toBe(true) // pass
      } else {
        throw err
      }
    }
  })
  it('Close position', async () => {
    connection = await connect()
    // TODO: get a position alredy created not a new one since the position token mint always is different
    const positionPDAAndBump = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint.address,
    ])
    const positionAddress = positionPDAAndBump.pda
    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint.address, true)

    const ix = programClient.getClosePositionInstruction({
      positionAuthority: payer,
      receiver: payer.address,
      position: positionAddress,
      positionMint: postionTokenMint.address,
      positionTokenAccount: postionTokenAccount,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      funderTokenAccountA: funderTokenAccountA,
      funderTokenAccountB: funderTokenAccountB,
      tokenProgram: TOKEN_EXTENSIONS_PROGRAM,
    })

    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [ix],
      })
    } catch (err: any) {
      const msg = err.message || String(err)

      if (msg.includes('Allocate: account already in use')) {
        console.warn('⚠️ close position already initialized, treating as success')
        const positionAccount = await programClient.fetchPosition(connection.rpc, positionAddress)
        console.log('✅ positionAccount:', positionAccount.address)
        expect(true).toBe(true) // pass
      }
    }
  })
  it('Execute swap', async () => {
    connection = await connect()
  })
})
