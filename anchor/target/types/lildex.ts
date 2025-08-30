/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lildex.json`.
 */
export type Lildex = {
  "address": "6TnPz5JHzrJdj9oBFcs87zW2ewg4C5gWDPDkBzMXTfLD",
  "metadata": {
    "name": "lildex",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closePosition",
      "discriminator": [
        123,
        134,
        81,
        0,
        49,
        68,
        98,
        98
      ],
      "accounts": [
        {
          "name": "positionAuthority",
          "signer": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ]
          }
        },
        {
          "name": "positionMint",
          "writable": true
        },
        {
          "name": "positionTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "funder"
              }
            ]
          }
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeAuthority",
          "type": "pubkey"
        },
        {
          "name": "defaultProtocolFeeRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializePool",
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "lilpoolsConfig"
        },
        {
          "name": "tokenMintA"
        },
        {
          "name": "tokenMintB"
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "lilpool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  108,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "lilpoolsConfig"
              },
              {
                "kind": "account",
                "path": "tokenMintA"
              },
              {
                "kind": "account",
                "path": "tokenMintB"
              }
            ]
          }
        },
        {
          "name": "tokenVaultA",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lilpool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintA"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenVaultB",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lilpool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintB"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initialPrice",
          "type": "u128"
        }
      ]
    },
    {
      "name": "openPosition",
      "discriminator": [
        135,
        128,
        47,
        77,
        15,
        152,
        240,
        49
      ],
      "accounts": [
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner"
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ]
          }
        },
        {
          "name": "positionMint"
        },
        {
          "name": "positionTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lilpool"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "swap",
      "discriminator": [
        248,
        198,
        158,
        145,
        225,
        117,
        135,
        200
      ],
      "accounts": [
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenAuthority",
          "signer": true
        },
        {
          "name": "lilpool",
          "writable": true
        },
        {
          "name": "tokenOwnerAccountA",
          "writable": true
        },
        {
          "name": "tokenVaultA",
          "writable": true
        },
        {
          "name": "tokenOwnerAccountB",
          "writable": true
        },
        {
          "name": "tokenVaultB",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minAmountOut",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lilpool",
      "discriminator": [
        80,
        244,
        66,
        167,
        64,
        146,
        225,
        77
      ]
    },
    {
      "name": "lilpoolsConfig",
      "discriminator": [
        135,
        205,
        37,
        134,
        15,
        158,
        23,
        212
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    }
  ],
  "events": [
    {
      "name": "traded",
      "discriminator": [
        225,
        202,
        73,
        175,
        147,
        43,
        160,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidEnum",
      "msg": "Enum value could not be converted"
    },
    {
      "code": 6001,
      "name": "invalidStartTick",
      "msg": "Invalid start tick index provided."
    },
    {
      "code": 6002,
      "name": "tickArrayExistInPool",
      "msg": "Tick-array already exists in this whirlpool"
    },
    {
      "code": 6003,
      "name": "tickArrayIndexOutofBounds",
      "msg": "Attempt to search for a tick-array failed"
    },
    {
      "code": 6004,
      "name": "invalidTickSpacing",
      "msg": "Tick-spacing is not supported"
    },
    {
      "code": 6005,
      "name": "closePositionNotEmpty",
      "msg": "Position is not empty It cannot be closed"
    },
    {
      "code": 6006,
      "name": "divideByZero",
      "msg": "Unable to divide by zero"
    },
    {
      "code": 6007,
      "name": "numberCastError",
      "msg": "Unable to cast number into BigInt"
    },
    {
      "code": 6008,
      "name": "numberDownCastError",
      "msg": "Unable to down cast number"
    },
    {
      "code": 6009,
      "name": "tickNotFound",
      "msg": "Tick not found within tick array"
    },
    {
      "code": 6010,
      "name": "invalidTickIndex",
      "msg": "Provided tick index is either out of bounds or uninitializable"
    },
    {
      "code": 6011,
      "name": "sqrtPriceOutOfBounds",
      "msg": "Provided sqrt price out of bounds"
    },
    {
      "code": 6012,
      "name": "liquidityZero",
      "msg": "Liquidity amount must be greater than zero"
    },
    {
      "code": 6013,
      "name": "liquidityTooHigh",
      "msg": "Liquidity amount must be less than i64::MAX"
    },
    {
      "code": 6014,
      "name": "liquidityOverflow",
      "msg": "Liquidity overflow"
    },
    {
      "code": 6015,
      "name": "liquidityUnderflow",
      "msg": "Liquidity underflow"
    },
    {
      "code": 6016,
      "name": "liquidityNetError",
      "msg": "Tick liquidity net underflowed or overflowed"
    },
    {
      "code": 6017,
      "name": "tokenMaxExceeded",
      "msg": "Exceeded token max"
    },
    {
      "code": 6018,
      "name": "tokenMinSubceeded",
      "msg": "Did not meet token min"
    },
    {
      "code": 6019,
      "name": "missingOrInvalidDelegate",
      "msg": "Position token account has a missing or invalid delegate"
    },
    {
      "code": 6020,
      "name": "invalidPositionTokenAmount",
      "msg": "Position token amount must be 1"
    },
    {
      "code": 6021,
      "name": "invalidTimestampConversion",
      "msg": "Timestamp should be convertible from i64 to u64"
    },
    {
      "code": 6022,
      "name": "invalidTimestamp",
      "msg": "Timestamp should be greater than the last updated timestamp"
    },
    {
      "code": 6023,
      "name": "invalidTickArraySequence",
      "msg": "Invalid tick array sequence provided for instruction."
    },
    {
      "code": 6024,
      "name": "invalidTokenMintOrder",
      "msg": "Token Mint in wrong order"
    },
    {
      "code": 6025,
      "name": "rewardNotInitialized",
      "msg": "Reward not initialized"
    },
    {
      "code": 6026,
      "name": "invalidRewardIndex",
      "msg": "Invalid reward index"
    },
    {
      "code": 6027,
      "name": "rewardVaultAmountInsufficient",
      "msg": "Reward vault requires amount to support emissions for at least one day"
    },
    {
      "code": 6028,
      "name": "feeRateMaxExceeded",
      "msg": "Exceeded max fee rate"
    },
    {
      "code": 6029,
      "name": "protocolFeeRateMaxExceeded",
      "msg": "Exceeded max protocol fee rate"
    },
    {
      "code": 6030,
      "name": "multiplicationShiftRightOverflow",
      "msg": "Multiplication with shift right overflow"
    },
    {
      "code": 6031,
      "name": "mulDivOverflow",
      "msg": "Muldiv overflow"
    },
    {
      "code": 6032,
      "name": "mulDivInvalidInput",
      "msg": "Invalid div_u256 input"
    },
    {
      "code": 6033,
      "name": "multiplicationOverflow",
      "msg": "Multiplication overflow"
    },
    {
      "code": 6034,
      "name": "invalidSqrtPriceLimitDirection",
      "msg": "Provided SqrtPriceLimit not in the same direction as the swap."
    },
    {
      "code": 6035,
      "name": "zeroTradableAmount",
      "msg": "There are no tradable amount to swap."
    },
    {
      "code": 6036,
      "name": "amountOutBelowMinimum",
      "msg": "Amount out below minimum threshold"
    },
    {
      "code": 6037,
      "name": "amountInAboveMaximum",
      "msg": "Amount in above maximum threshold"
    },
    {
      "code": 6038,
      "name": "tickArraySequenceInvalidIndex",
      "msg": "Invalid index for tick array sequence"
    },
    {
      "code": 6039,
      "name": "amountCalcOverflow",
      "msg": "Amount calculated overflows"
    },
    {
      "code": 6040,
      "name": "amountRemainingOverflow",
      "msg": "Amount remaining overflows"
    },
    {
      "code": 6041,
      "name": "invalidIntermediaryMint",
      "msg": "Invalid intermediary mint"
    },
    {
      "code": 6042,
      "name": "duplicateTwoHopPool",
      "msg": "Duplicate two hop pool"
    },
    {
      "code": 6043,
      "name": "invalidBundleIndex",
      "msg": "Bundle index is out of bounds"
    },
    {
      "code": 6044,
      "name": "bundledPositionAlreadyOpened",
      "msg": "Position has already been opened"
    },
    {
      "code": 6045,
      "name": "bundledPositionAlreadyClosed",
      "msg": "Position has already been closed"
    },
    {
      "code": 6046,
      "name": "positionBundleNotDeletable",
      "msg": "Unable to delete PositionBundle with open positions"
    },
    {
      "code": 6047,
      "name": "unsupportedTokenMint",
      "msg": "Token mint has unsupported attributes"
    },
    {
      "code": 6048,
      "name": "remainingAccountsInvalidSlice",
      "msg": "Invalid remaining accounts"
    },
    {
      "code": 6049,
      "name": "remainingAccountsInsufficient",
      "msg": "Insufficient remaining accounts"
    },
    {
      "code": 6050,
      "name": "noExtraAccountsForTransferHook",
      "msg": "Unable to call transfer hook without extra accounts"
    },
    {
      "code": 6051,
      "name": "intermediateTokenAmountMismatch",
      "msg": "Output and input amount mismatch"
    },
    {
      "code": 6052,
      "name": "transferFeeCalculationError",
      "msg": "Transfer fee calculation failed"
    },
    {
      "code": 6053,
      "name": "remainingAccountsDuplicatedAccountsType",
      "msg": "Same accounts type is provided more than once"
    },
    {
      "code": 6054,
      "name": "fullRangeOnlyPool",
      "msg": "This whirlpool only supports full-range positions"
    },
    {
      "code": 6055,
      "name": "tooManySupplementalTickArrays",
      "msg": "Too many supplemental tick arrays provided"
    },
    {
      "code": 6056,
      "name": "differentWhirlpoolTickArrayAccount",
      "msg": "TickArray account for different whirlpool provided"
    },
    {
      "code": 6057,
      "name": "partialFillError",
      "msg": "Trade resulted in partial fill"
    },
    {
      "code": 6058,
      "name": "positionNotLockable",
      "msg": "Position is not lockable"
    },
    {
      "code": 6059,
      "name": "operationNotAllowedOnLockedPosition",
      "msg": "Operation not allowed on locked position"
    },
    {
      "code": 6060,
      "name": "sameTickRangeNotAllowed",
      "msg": "Cannot reset position range with same tick range"
    },
    {
      "code": 6061,
      "name": "invalidAdaptiveFeeConstants",
      "msg": "Invalid adaptive fee constants"
    },
    {
      "code": 6062,
      "name": "invalidFeeTierIndex",
      "msg": "Invalid fee tier index"
    },
    {
      "code": 6063,
      "name": "invalidTradeEnableTimestamp",
      "msg": "Invalid trade enable timestamp"
    },
    {
      "code": 6064,
      "name": "tradeIsNotEnabled",
      "msg": "Trade is not enabled yet"
    },
    {
      "code": 6065,
      "name": "rentCalculationError",
      "msg": "Rent calculation error"
    },
    {
      "code": 6066,
      "name": "featureIsNotEnabled",
      "msg": "Feature is not enabled"
    },
    {
      "code": 6067,
      "name": "positionWithTokenExtensionsRequired",
      "msg": "This whirlpool only supports open_position_with_token_extensions instruction"
    },
    {
      "code": 6068,
      "name": "slippageExceeded",
      "msg": "Amount out slippage exceeded"
    }
  ],
  "types": [
    {
      "name": "lilpool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpoolsConfig",
            "type": "pubkey"
          },
          {
            "name": "tokenMintA",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultA",
            "type": "pubkey"
          },
          {
            "name": "tokenMintB",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultB",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeRate",
            "type": "u16"
          },
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "price",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "lilpoolsConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeAuthority",
            "type": "pubkey"
          },
          {
            "name": "defaultProtocolFeeRate",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpool",
            "type": "pubkey"
          },
          {
            "name": "positionMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "traded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpool",
            "type": "pubkey"
          },
          {
            "name": "aToB",
            "type": "bool"
          },
          {
            "name": "inputAmount",
            "type": "u64"
          },
          {
            "name": "outputAmount",
            "type": "u64"
          },
          {
            "name": "inputTransferFee",
            "type": "u64"
          },
          {
            "name": "outputTransferFee",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
