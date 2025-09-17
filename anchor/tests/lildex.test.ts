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
  let tokenVaultA: KeyPairSigner
  let tokenVaultB: KeyPairSigner
  const tokenDecimals = 9
  let funderTokenAccountA: Address
  let funderTokenAccountB: Address
  let lilpoolAddress: Address
  let configAddress: Address
  // Both tokens have 9 decimals, so we can use this to convert between major and minor units
  const TOKEN = 10n ** BigInt(tokenDecimals)
  // const userInitialTokenAmount = 10n * TOKEN
  const tokenAOfferedAmount = 1n * TOKEN
  const initialPrice = 3n * TOKEN
  const tokenBRaw = (tokenAOfferedAmount * initialPrice) / BigInt(10 ** 9)
  const tokenBWantedAmount = tokenBRaw

  beforeAll(async () => {
    connection = await connect()
    // lildex = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile()

    // Create two token mints - the factories that create token A, and token B
    // spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
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
    // devnet
    // tokenMintA = address('G2uaA9VLQD9sJXnYMYT2Pjk6kaSv3CdnAA4rcWvBREVw')
    // tokenMintB = address('BPacU77oBuEGZ9Kkmyi9Y5iiUKkB1tCVjEcbi7TarbeS')
    // localnet
    tokenMintA = address('s26VZDn3BkY5jHUKCQ8C7tDGG2v5XzWiWiDPu9EK4WT') //no-ex
    tokenMintB = address('6Ddpn9kLXdGZVK8G1bbidxcfvfUxAba1T1tnKuhdBHq3') //yes-ex
    // Mint tokens to the user
    // const appWallet = address('Cp3hG8RqRV7ifQaNoXQSxQVc63wSNyj9Junjs14LEQqQ')
    // await connection.mintTokens(tokenMintA, payer, userInitialTokenAmount, payer.address)
    // await connection.mintTokens(tokenMintB, payer, userInitialTokenAmount, payer.address)
    // get funder token accounts
    funderTokenAccountA = await connection.getTokenAccountAddress(payer.address, tokenMintA, false)
    funderTokenAccountB = await connection.getTokenAccountAddress(payer.address, tokenMintB, true)
    console.log('funderA:', funderTokenAccountA)
    console.log('funderB:', funderTokenAccountB)
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
    tokenVaultA = await generateKeyPairSigner()
    tokenVaultB = await generateKeyPairSigner()
    postionTokenMint = await generateKeyPairSigner()
  })
  // add it.only and connect('devnet) when wat to create this config in devnet
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
      console.log('✅ configAccount:', configAccount.address)
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

  it.only('Initialize pool', async () => {
    connection = await connect()

    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint.address, true)
    const { pda: positionAddress } = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint.address,
    ])
    const tokenProgramA = await connection.getMint(tokenMintA)
    const tokenProgramB = await connection.getMint(tokenMintB)
    console.log('initialPrice:', initialPrice)
    console.log('tokenAAmount:', tokenAOfferedAmount)
    console.log('tokenBAmount:', tokenBWantedAmount)
    console.log('tokenProgramA:', tokenProgramA.programAddress)
    console.log('tokenProgramB:', tokenProgramB.programAddress)

    const initPoolIx = programClient.getInitializePoolInstruction({
      lilpoolsConfig: configAddress,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      funder: payer,
      lilpool: lilpoolAddress,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      initialPrice: initialPrice,
      tokenProgramA: tokenProgramA.programAddress,
      tokenProgramB: tokenProgramB.programAddress,
    })
    const openPositionIx = programClient.getOpenPositionInstruction({
      funder: payer,
      owner: payer.address,
      positionMint: postionTokenMint,
      positionTokenAccount: postionTokenAccount,
      position: positionAddress,
      lilpool: lilpoolAddress,
      tokenAAmount: tokenAOfferedAmount,
      tokenBAmount: tokenBWantedAmount,
      metadataUpdateAuth: payer.address,
      token2022Program: TOKEN_EXTENSIONS_PROGRAM,
    })

    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [initPoolIx, openPositionIx],
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
        if (err.cause) {
          console.error('Cause of failure:', err.cause)
        }
        throw err // fail test for any other error
      }
    }
  })
  it('Open position', async () => {
    connection = await connect()
    const postionTokenAccount = await connection.getTokenAccountAddress(payer.address, postionTokenMint.address, true)
    const { pda: positionAddress } = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'position',
      postionTokenMint.address,
    ])

    const { pda: lilpoolAddress } = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      tokenMintA,
      tokenMintB,
    ])

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
    connection = await connect('devnet')

    const getOffers = connection.getAccountsFactory(
      programClient.LILDEX_PROGRAM_ADDRESS,
      programClient.POSITION_DISCRIMINATOR,
      programClient.getPositionDecoder(),
    )

    const positions = await getOffers()
    const position1 = positions[0]

    let postionTokenAccount
    let lilpool
    let positionMint
    if (position1.exists) {
      lilpool = position1.data.lilpool
      positionMint = position1.data.positionMint
    }
    postionTokenAccount = await connection.getTokenAccountAddress(payer.address, positionMint!, true)
    const ix = programClient.getClosePositionInstruction({
      lilpool: lilpool!,
      positionAuthority: payer,
      receiver: payer.address,
      position: position1.address,
      positionMint: positionMint!,
      positionTokenAccount: postionTokenAccount!,
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
      if (err.cause) {
        console.error('Cause of failure:', err.cause)
      }
      throw err
    }
  })
  it('Execute swap', async () => {
    connection = await connect()

    const { pda: lilpoolAddress } = await connection.getPDAAndBump(programClient.LILDEX_PROGRAM_ADDRESS, [
      'lilpool',
      configAddress,
      tokenMintA,
      tokenMintB,
    ])
    const { data: lilpoolData } = await programClient.fetchLilpool(connection.rpc, lilpoolAddress)
    const tokenAAmount = 1n * TOKEN
    const tokenBAmount = tokenAAmount * lilpoolData.price

    const ix = programClient.getSwapInstruction({
      receiver: payer,
      lilpool: lilpoolAddress,
      amountIn: tokenAAmount,
      amountOut: tokenBAmount,
      aToB: true,
      tokenMintA: tokenMintA,
      tokenMintB: tokenMintB,
      tokenReceiverAccountA: funderTokenAccountA,
      tokenReceiverAccountB: funderTokenAccountB,
      tokenVaultA: tokenVaultA,
      tokenVaultB: tokenVaultB,
      tokenProgram: TOKEN_EXTENSIONS_PROGRAM,
    })
    try {
      await connection.sendTransactionFromInstructions({
        feePayer: payer,
        instructions: [ix],
      })
    } catch (err: any) {
      console.log(err)
    }
  })
})
