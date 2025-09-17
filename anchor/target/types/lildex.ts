/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lildex.json`.
 */
export type Lildex = {
  "address": "3wDmGCdec3eXwGYXiHAUBMuXSTskMgc2imk5vRzU5iHC",
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
          "name": "token2022Program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": []
    },
    {
      "name": "decreaseLiquidity",
      "discriminator": [
        160,
        38,
        208,
        111,
        104,
        91,
        44,
        1
      ],
      "accounts": [
        {
          "name": "lilpool",
          "writable": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgramA"
        },
        {
          "name": "tokenProgramB"
        },
        {
          "name": "positionAuthority",
          "signer": true
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "positionTokenAccount"
        },
        {
          "name": "tokenMintA"
        },
        {
          "name": "tokenMintB"
        },
        {
          "name": "tokenOwnerAccountA",
          "writable": true
        },
        {
          "name": "tokenOwnerAccountB",
          "writable": true
        },
        {
          "name": "tokenVaultA",
          "writable": true
        },
        {
          "name": "tokenVaultB",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "tokenMaxA",
          "type": "u64"
        },
        {
          "name": "tokenMaxB",
          "type": "u64"
        }
      ]
    },
    {
      "name": "increaseLiquidity",
      "discriminator": [
        46,
        156,
        243,
        118,
        13,
        205,
        251,
        178
      ],
      "accounts": [
        {
          "name": "lilpool",
          "writable": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgramA"
        },
        {
          "name": "tokenProgramB"
        },
        {
          "name": "positionAuthority",
          "signer": true
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "positionTokenAccount"
        },
        {
          "name": "tokenMintA"
        },
        {
          "name": "tokenMintB"
        },
        {
          "name": "tokenOwnerAccountA",
          "writable": true
        },
        {
          "name": "tokenOwnerAccountB",
          "writable": true
        },
        {
          "name": "tokenVaultA",
          "writable": true
        },
        {
          "name": "tokenVaultB",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "tokenMaxA",
          "type": "u64"
        },
        {
          "name": "tokenMaxB",
          "type": "u64"
        }
      ]
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
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
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
          "signer": true
        },
        {
          "name": "tokenVaultB",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgramA"
        },
        {
          "name": "tokenProgramB"
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
          "type": "u64"
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
          "name": "positionMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "positionTokenAccount",
          "writable": true
        },
        {
          "name": "lilpool"
        },
        {
          "name": "token2022Program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "metadataUpdateAuth",
          "address": "3wDmGCdec3eXwGYXiHAUBMuXSTskMgc2imk5vRzU5iHC"
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
          "name": "receiver",
          "writable": true,
          "signer": true
        },
        {
          "name": "lilpool",
          "writable": true
        },
        {
          "name": "tokenReceiverAccountA",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "receiver"
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
          "name": "tokenReceiverAccountB",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "receiver"
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
          "name": "tokenVaultA",
          "writable": true
        },
        {
          "name": "tokenVaultB",
          "writable": true
        },
        {
          "name": "tokenMintA"
        },
        {
          "name": "tokenMintB"
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
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "amountOut",
          "type": "u64"
        },
        {
          "name": "aToB",
          "type": "bool"
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
      "name": "liquidityDecreased",
      "discriminator": [
        166,
        1,
        36,
        71,
        112,
        202,
        181,
        171
      ]
    },
    {
      "name": "liquidityIncreased",
      "discriminator": [
        30,
        7,
        144,
        181,
        102,
        254,
        155,
        161
      ]
    },
    {
      "name": "poolInitialized",
      "discriminator": [
        100,
        118,
        173,
        87,
        12,
        198,
        254,
        229
      ]
    },
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
      "name": "closePositionNotEmpty",
      "msg": "Position is not empty It cannot be closed"
    },
    {
      "code": 6001,
      "name": "divideByZero",
      "msg": "Unable to divide by zero"
    },
    {
      "code": 6002,
      "name": "numberCastError",
      "msg": "Unable to cast number into BigInt"
    },
    {
      "code": 6003,
      "name": "liquidityZero",
      "msg": "Liquidity amount must be greater than zero"
    },
    {
      "code": 6004,
      "name": "liquidityTooHigh",
      "msg": "Liquidity amount must be less than i64::MAX"
    },
    {
      "code": 6005,
      "name": "liquidityOverflow",
      "msg": "Liquidity overflow"
    },
    {
      "code": 6006,
      "name": "liquidityUnderflow",
      "msg": "Liquidity underflow"
    },
    {
      "code": 6007,
      "name": "tokenMaxExceeded",
      "msg": "Exceeded token max"
    },
    {
      "code": 6008,
      "name": "tokenMinSubceeded",
      "msg": "Did not meet token min"
    },
    {
      "code": 6009,
      "name": "missingOrInvalidDelegate",
      "msg": "Position token account has a missing or invalid delegate"
    },
    {
      "code": 6010,
      "name": "invalidPositionTokenAmount",
      "msg": "Position token amount must be 1"
    },
    {
      "code": 6011,
      "name": "rewardVaultAmountInsufficient",
      "msg": "Reward vault requires amount to support emissions for at least one day"
    },
    {
      "code": 6012,
      "name": "feeRateMaxExceeded",
      "msg": "Exceeded max fee rate"
    },
    {
      "code": 6013,
      "name": "protocolFeeRateMaxExceeded",
      "msg": "Exceeded max protocol fee rate"
    },
    {
      "code": 6014,
      "name": "invalidSqrtPriceLimitDirection",
      "msg": "Provided SqrtPriceLimit not in the same direction as the swap."
    },
    {
      "code": 6015,
      "name": "zeroTradableAmount",
      "msg": "There are no tradable amount to swap."
    },
    {
      "code": 6016,
      "name": "amountOutBelowMinimum",
      "msg": "Amount out below minimum threshold"
    },
    {
      "code": 6017,
      "name": "amountInAboveMaximum",
      "msg": "Amount in above maximum threshold"
    },
    {
      "code": 6018,
      "name": "unsupportedTokenMint",
      "msg": "Token mint has unsupported attributes"
    },
    {
      "code": 6019,
      "name": "positionWithTokenExtensionsRequired",
      "msg": "This whirlpool only supports open_position_with_token_extensions instruction"
    },
    {
      "code": 6020,
      "name": "slippageExceeded",
      "msg": "Amount out slippage exceeded"
    },
    {
      "code": 6021,
      "name": "insufficientMakerBalance",
      "msg": "Insufficient token balance in funder's account"
    },
    {
      "code": 6022,
      "name": "invalidAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6023,
      "name": "notEqualAmount",
      "msg": "Amount must be 50%/50%"
    },
    {
      "code": 6024,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint - must be different from offered token"
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
            "type": "u64"
          },
          {
            "name": "lilpoolBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
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
      "name": "liquidityDecreased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpool",
            "type": "pubkey"
          },
          {
            "name": "position",
            "type": "pubkey"
          },
          {
            "name": "tokenAAmount",
            "type": "u64"
          },
          {
            "name": "tokenBAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "liquidityIncreased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpool",
            "type": "pubkey"
          },
          {
            "name": "position",
            "type": "pubkey"
          },
          {
            "name": "tokenAAmount",
            "type": "u64"
          },
          {
            "name": "tokenBAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poolInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lilpoolsConfig",
            "type": "pubkey"
          },
          {
            "name": "lilpool",
            "type": "pubkey"
          },
          {
            "name": "tokenMintA",
            "type": "pubkey"
          },
          {
            "name": "tokenMintB",
            "type": "pubkey"
          },
          {
            "name": "tokenProgramA",
            "type": "pubkey"
          },
          {
            "name": "tokenProgramB",
            "type": "pubkey"
          },
          {
            "name": "decimalsA",
            "type": "u8"
          },
          {
            "name": "decimalsB",
            "type": "u8"
          },
          {
            "name": "initialPrice",
            "type": "u64"
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
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "positionMint",
            "type": "pubkey"
          },
          {
            "name": "tokenAAmount",
            "type": "u64"
          },
          {
            "name": "tokenBAmount",
            "type": "u64"
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
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
