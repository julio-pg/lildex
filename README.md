# 🪙 LilDex

LilDex is a **Decentralized Exchange (DEX)** built on **Solana** using **Anchor** for the on-chain program and **React** for the frontend.  
It allows users to:

- Create liquidity pools
- Add liquidity to existing pools
- Withdraw liquidity from pools
- Swap tokens available in the pool pairs

---

## 🚀 Features

- **Pool Creation**: Easily create new token pairs on Solana.
- **Liquidity Provisioning**: Add your tokens to pools and earn a share of swap fees.
- **Liquidity Withdrawal**: Remove your liquidity at any time.
- **Token Swaps**: Trade between supported pool pairs instantly.

---

## 🛠️ Tech Stack

- **Smart Contracts**: [Anchor](https://book.anchor-lang.com/) framework for Solana programs.
- **Blockchain**: [Solana](https://solana.com/).
- **Frontend**: [React](https://react.dev/) with hooks and context for wallet integration.
- **Wallet**: Compatible with [Phantom](https://phantom.app/) and other Solana wallets.

---

## ⚙️ Installation

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://book.anchor-lang.com/getting_started/installation.html)
- [Node.js](https://nodejs.org/) & npm (or yarn)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/julio-pg/lildex.git
   cd lilDex
   ```

2. Install dependencies for the frontend:

   ```bash
   cd app
   pnpm install
   ```

3. Build and deploy the Solana program locally:

   ```bash
   pnpm run anchor-build
   pnpm run anchor deploy
   ```

4. Run the frontend app:

   ```bash
   pnpm run dev
   ```

---

## 🧪 Testing

Run Anchor tests:

```bash
pnpm run anchor-test
```

---

## 🎨 UI Preview

The LilDex frontend provides a simple interface for:

- Connecting your wallet
- Viewing existing pools
- Creating pools
- Adding/removing liquidity
- Swapping tokens

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo, create a feature branch, and submit a PR.

---

## 📜 License

MIT License © 2025 LilDex
