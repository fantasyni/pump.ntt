# pump.ntt

**pump.ntt** is a one-click dapp for easily deploying your own native token across blockchains powered by [Wormhole Ntt](https://wormhole.com/products/native-token-transfers)

![ntts](./img/ntts.png)
![bridge](./img/bridge.png)

After deploying, you can use bridge to transfer your native tokens accross blockchains

## Getting Started 

#### Installation

```bash
npm install
```

### Deploying Smart Contract
* PumpNtt

```bash
cd contracts/PumpNtt
sui client publish
```

* Ntt
https://github.com/fantasyni/wormhole-aptos-native-token-transfer/tree/ntt/starter

```bash
cd sui/contracts
sui client publish
```

```bash
cd aptos/contracts
aptos move create-object-and-publish-package --address-name wormhole_ntt
```

### Configuration

Configure src/constants.ts
* PumpNttPackageId
* PumpNttObjectType
* SuiNttPackageId
* AptosNttPackageId

### Start Dapp

```bash
npm run dev
```

### Dapp operations

#### Create Ntt
![create_ntt](./img/create_ntt.png)
#### Add Chain
![deploy_ntt](./img/deploy_ntt.png)
![deploy_token](./img/deploy_token.png)
![register_token](./img/register_token.png)
#### Set Peer Chain
![set_peer](./img/set_peer.png)
#### Transfer Ntt 
![transfer_ntt](./img/transfer_ntt.png)