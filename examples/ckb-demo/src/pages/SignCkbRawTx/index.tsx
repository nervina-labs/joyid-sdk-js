import { useState } from 'react'
import { Button, VStack, Input, Text, Link, useToast } from '@chakra-ui/react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CKBTransaction, signRawTransaction } from '@joyid/ckb'
import {
  Aggregator,
  Collector,
  InscriptionInfo,
  JoyIDConfig,
  NoLiveCellException,
  buildDeployTx,
  buildMintTx,
  buildTransferTx,
} from 'ckb-omiga'
import {
  buildCancelTx,
  buildMakerTx,
  Collector as DexCollector,
  JoyIDConfig as DexJoyIDConfig,
} from '@nervina-labs/ckb-dex'
import { blockchain } from '@ckb-lumos/base'
import { bytes } from '@ckb-lumos/codec'
import { useAccount } from '../../hooks'
import { RoutePath } from '../../route/path'
import { CKB_INDEXER_URL, CKB_RPC_URL, COTA_AGGREGATOR_URL } from '../../env'

const info: InscriptionInfo = {
  maxSupply: BigInt(2100_0000),
  mintLimit: BigInt(1000),
  xudtHash: '',
  mintStatus: 0,
  decimal: 8,
  name: 'CKB Fist Inscription',
  symbol: 'CKBI',
}
const collector = new Collector({
  ckbNodeUrl: CKB_RPC_URL,
  ckbIndexerUrl: CKB_INDEXER_URL,
})
const aggregator = new Aggregator(COTA_AGGREGATOR_URL)

const dexCollector = new DexCollector({
  ckbNodeUrl: CKB_RPC_URL,
  ckbIndexerUrl: CKB_INDEXER_URL,
})

export function SignCkbRawTx() {
  const account = useAccount()
  const navi = useNavigate()
  const toast = useToast()
  const ckbAddress = account?.address
  const [id, setId] = useState('')
  const [deployHash, setDeployHash] = useState('')
  const [mintHash, setMintHash] = useState('')
  const [transferHash, setTransferHash] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [listHash, setListHash] = useState('')
  const [xudtType, setXudtType] = useState<
    CKBComponents.Script | null | undefined
  >(null)
  const [cancelHash, setCancelHash] = useState('')

  const joyID: JoyIDConfig = {
    aggregator,
    connectData: account as any,
  }

  const deploy = async () => {
    try {
      const { rawTx, inscriptionId } = await buildDeployTx({
        collector,
        joyID,
        address: ckbAddress!,
        info,
      })
      setId(inscriptionId)
      const signedTx = await signRawTransaction(
        rawTx as CKBTransaction,
        ckbAddress!
      )
      const hash = await collector.getCkb().rpc.sendTransaction(signedTx)
      setDeployHash(hash)
    } catch (error) {
      if (error && error instanceof NoLiveCellException) {
        toast({
          status: 'warning',
          title: 'CKB balance is not enough',
        })
      }
      console.error(error)
    }
  }

  const mint = async () => {
    const rawTx = await buildMintTx({
      collector,
      joyID,
      address: ckbAddress!,
      inscriptionId: id,
      mintLimit: BigInt(info.mintLimit) * BigInt(10 ** info.decimal),
    })
    if (rawTx.outputs.length >= 2) {
      setXudtType(rawTx.outputs[1].type)
    }
    const signedTx = await signRawTransaction(
      rawTx as CKBTransaction,
      ckbAddress!
    )

    const hash = await collector.getCkb().rpc.sendTransaction(signedTx)
    setMintHash(hash)
  }

  const transfer = async () => {
    const rawTx = await buildTransferTx({
      collector,
      joyID,
      address: ckbAddress!,
      inscriptionId: id,
      toAddress,
    })
    const signedTx = await signRawTransaction(
      rawTx as CKBTransaction,
      ckbAddress!
    )
    const hash = await collector.getCkb().rpc.sendTransaction(signedTx)
    setTransferHash(hash)
  }

  const listXudt = async () => {
    if (!xudtType) {
      toast({ status: 'error', title: 'Xudt type script cannot be empty' })
      return
    }
    const { rawTx, listPackage, witnessIndex } = await buildMakerTx({
      collector: dexCollector,
      // @ts-ignore
      joyID: joyID as DexJoyIDConfig,
      seller: ckbAddress!,
      listAmount: BigInt(1000 * 10 ** info.decimal),
      totalValue: BigInt(200 * 10 ** 8),
      xudtType: bytes.hexify(blockchain.Script.pack(xudtType)),
    })
    toast({
      status: 'info',
      title: `List package is: ${listPackage / BigInt(10 ** 8)}CKB`,
    })
    const signedTx = await signRawTransaction(rawTx, ckbAddress!, {
      witnessIndex,
    })
    const hash = await collector.getCkb().rpc.sendTransaction(signedTx)
    setListHash(hash)
  }

  const cancelOrder = async () => {
    if (!xudtType) {
      toast({ status: 'error', title: 'Xudt type script cannot be empty' })
      return
    }
    const orderOutPoint = {
      txHash: listHash,
      index: '0x0',
    }
    const orderOutPoints = [
      bytes.hexify(blockchain.OutPoint.pack(orderOutPoint)),
    ]
    const { rawTx, witnessIndex } = await buildCancelTx({
      collector: dexCollector,
      // @ts-ignore
      joyID: joyID as DexJoyIDConfig,
      seller: ckbAddress!,
      orderOutPoints,
    })
    const signedTx = await signRawTransaction(rawTx, ckbAddress!, {
      witnessIndex,
    })
    const hash = await collector.getCkb().rpc.sendTransaction(signedTx)
    setCancelHash(hash)
  }

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />
  }

  return (
    <div className="App">
      <VStack spacing={4}>
        <Text>Name: CKB First Inscription</Text>
        <Text>Symbol: CKBI</Text>
        <Text>Decimal: 8</Text>
        <Text>MaxSupply: 21000000</Text>
        <Text>MintLimit: 1000</Text>
        <Button colorScheme="teal" w="240px" onClick={deploy}>
          Deploy CKB Inscription
        </Button>
        {id && <Text>{`Inscription Id: ${id}`}</Text>}
        {deployHash && (
          <Link
            isExternal
            href={`https://pudge.explorer.nervos.org/transaction/${deployHash}`}
          >{`Deploy tx hash: ${deployHash}`}</Link>
        )}

        {id && (
          <>
            <Button colorScheme="teal" w="240px" onClick={mint}>
              Mint 1000 CKBI
            </Button>
            {mintHash && (
              <Link
                isExternal
                href={`https://pudge.explorer.nervos.org/transaction/${mintHash}`}
              >{`Mint tx hash: ${mintHash}`}</Link>
            )}
            {mintHash && (
              <>
                <Input
                  placeholder="to CKB address"
                  onChange={(e) => setToAddress(e.currentTarget.value)}
                />
                <Button
                  colorScheme="teal"
                  w="240px"
                  disabled={!toAddress}
                  onClick={transfer}
                >
                  Transfer 1000 CKBI
                </Button>
                {transferHash && (
                  <Link
                    isExternal
                    href={`https://pudge.explorer.nervos.org/transaction/${transferHash}`}
                  >{`Transfer tx hash: ${transferHash}`}</Link>
                )}

                <Button colorScheme="teal" w="320px" onClick={listXudt}>
                  List 1000 CKBI and the price is 200 CKB
                </Button>

                {listHash && (
                  <>
                    <Link
                      isExternal
                      href={`https://pudge.explorer.nervos.org/transaction/${listHash}`}
                    >{`List tx hash: ${listHash}`}</Link>

                    <Button colorScheme="teal" w="320px" onClick={cancelOrder}>
                      Cancel the above order
                    </Button>

                    {cancelHash && (
                      <Link
                        isExternal
                        href={`https://pudge.explorer.nervos.org/transaction/${cancelHash}`}
                      >{`Cancel tx hash: ${cancelHash}`}</Link>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        <Button colorScheme="purple" onClick={() => navi(RoutePath.Home)}>
          {`<< Go Home`}
        </Button>
      </VStack>
    </div>
  )
}
