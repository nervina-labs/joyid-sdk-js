# JoyID JavaScript SDK

This is monorepo for JoyID JavaScript SDK.

## Overview

In order to interact with [JoyID App](https://app.joy.id) we provide different packages to meet different requirements.

* [`@joyid/ckb`](./packages/ckb/): SDK for manipulating [Nervos CKB](https://www.nervos.org/) assets, including transferring CKB/mNFT/CoTA NFT, signing Raw Transaction, etc.
* [`@joyid/bitcoin`](./packages/bitcoin/): [UniSat Wallet](https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet) compatible SDK for manipulating [Bitcoin](https://bitcoin.org/) assets.
* [`@joyid/evm`](./packages//evm/): SDK for manipulating [EVM-compatible blockchains](https://blog.thirdweb.com/evm-compatible-blockchains-and-ethereum-virtual-machine/) assets.
* [`@joyid/nostr`](./packages//nostr/): [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) implementation for [Nostr](https://nostr.com/) protocol.
* [`@joyid/ethers`](./packages/ethers/): [Ethers.js](https://docs.ethers.io/v5/) implementation for JoyID EVM SDK.
* [`@joyid/wagmi`](./packages/wagmi/): [Wagmi](https://wagmi.io/) implementation for JoyID EVM SDK.
* [`@joyid/rainbowkit`](./packages/rainbowkit/): [RainbowKit](https://www.rainbowkit.com/) implementation for JoyID EVM SDK.
* [`@joyid/ethereum-provider`](./packages/ethereum-provider/): [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) implementation for JoyID EVM SDK.

You can choose the appropriate SDK package according to your application scenario and follow the instructions in the documentation for installation and use. If you need technical support, feel free to contact us in [Discord](https://discord.com/invite/77MyakRKVB).

## Examples

We provide examples for each package in the `examples` directory. Every example is a standalone project that demonstrates how to use the SDK in a specific scenario. You can run the examples by running the following commands:

```bash
pnpm run dev
```

There are six examples in the `examples` directory:

* [`CKB Demo`](./examples/ckb/): Example for `@joyid/ckb` SDK.
* [`Bitcoin Demo`](./examples/bitcoin/): Example for `@joyid/bitcoin` SDK.
* [`EVM Demo`](./examples/evm/): Example for `@joyid/evm` SDK.
* [`Wagmi Demo`](./examples/wagmi/): Example for `@joyid/wagmi` SDK.
* [`RainbowKit Demo`](./examples/rainbowkit/): Example for `@joyid/rainbowkit` SDK.
* [`nostr Demo`](./examples/nostr/): Example for `@joyid/nostr` SDK.

## Development

### Installation

```bash
npm i -g pnpm
pnpm install
```

### Build

```bash
pnpm build
```

## Contributing

We welcome contributions from the community. If you want to contribute to JoyID JavaScript SDK, please read the [Contributing Guide](./CONTRIBUTING.md) first.
