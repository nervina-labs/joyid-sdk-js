import { useRef, useState } from 'react'
import {
  Button,
  Textarea,
  VStack,
  useToast,
  Input,
  Alert,
  AlertIcon,
  Link,
  AlertDescription,
  AlertTitle,
  Text,
  FormLabel,
  FormControl,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { atom, useAtom } from 'jotai'
import { Navigate, useNavigate } from 'react-router-dom'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { map, debounceTime } from 'rxjs/operators'
import { signCotaNFTTx } from '@joyid/ckb'
import { useAccount } from '../../hooks'
import { RoutePath } from '../../route/path'
import { rpc } from '../../lumos'

const defaultAddress = ''
const defaultTokenKey = ''

const toAddressAtom = atom<string>(defaultAddress)
const tokenKeyAtom = atom<string>(defaultTokenKey)

const useToastError = () => {
  const toast = useToast()
  return (error: unknown) => {
    if (error instanceof Error) {
      toast({
        title: error.name,
        description: error.message,
        status: 'error',
      })
    } else {
      toast({
        title: 'Unknown Error',
        description: 'See devtool console for more details',
      })
    }

    console.error(error)
  }
}

export function SignCotaNFT() {
  const [toAddress, setToAddress] = useAtom(toAddressAtom)
  const [tokenKey, setTokenKey] = useAtom(tokenKeyAtom)
  const [txHash, setTxHash] = useState('')
  const toastError = useToastError()
  const [isTransferring, setIsTransferring] = useState(false)
  const account = useAccount()
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const tokenKeyRef = useRef<HTMLInputElement>(null)
  const navi = useNavigate()

  const [addressChange, addressChange$] = useObservableCallback<
    string,
    React.ChangeEvent<HTMLTextAreaElement>
  >((event$) =>
    event$.pipe(
      map((e) => e.target.value),
      debounceTime(500)
    )
  )

  useSubscription(addressChange$, async (toAddr: string) => {
    setToAddress(toAddr)
  })

  const [tokenKeyChange, tokenKeyChange$] = useObservableCallback<
    string,
    React.ChangeEvent<HTMLInputElement>
  >((event$) =>
    event$.pipe(
      map((e) => e.target.value),
      debounceTime(500)
    )
  )

  useSubscription(tokenKeyChange$, async (val: string) => {
    setTokenKey(val)
  })

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />
  }

  return (
    <div className="App">
      <VStack spacing={6}>
        <FormControl>
          <FormLabel>To Address:</FormLabel>
          <Textarea
            name="message"
            placeholder="CKB address"
            onChange={addressChange}
            ref={addressRef}
          />
        </FormControl>
        <FormControl>
          <FormLabel>CoTA NFT Token Key:</FormLabel>
          <Input
            onChange={tokenKeyChange}
            placeholder="CoTA NFT Token key(cotaId + tokenIndex)"
            ref={tokenKeyRef}
          />
        </FormControl>
        {txHash ? (
          <Alert
            status="success"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            variant="subtle">
            <AlertIcon />
            <AlertTitle>Transfer Successful</AlertTitle>
            <AlertDescription>
              <Text>{`The transaction hash is: `}</Text>
              <Link
                href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}
                isExternal
                wordBreak="break-all"
                textDecoration="underline">
                {txHash}
                <ExternalLinkIcon mx="2px" />
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          colorScheme="teal"
          w="240px"
          isLoading={isTransferring}
          loadingText={'Transferring...'}
          onClick={async () => {
            setIsTransferring(true)
            if (account == null) {
              return
            }
            const req = {
              to: toAddress,
              from: account.address,
              tokenKey,
            }
            try {
              const signedTx = await signCotaNFTTx(req)
              const hash = await rpc.sendTransaction(signedTx, 'passthrough')
              setTxHash(hash)
            } catch (error) {
              toastError(error)
            } finally {
              setIsTransferring(false)
            }
          }}>
          Transfer
        </Button>
        <Button
          colorScheme="red"
          w="240px"
          variant="outline"
          onClick={() => {
            setToAddress('')
            if (addressRef.current) {
              addressRef.current.value = ''
            }
            setTokenKey(defaultTokenKey)
            if (tokenKeyRef.current) {
              tokenKeyRef.current.value = defaultTokenKey
            }
            setTxHash('')
          }}>
          Reset
        </Button>
        <Button
          colorScheme="purple"
          onClick={() => {
            navi(RoutePath.Home)
          }}>
          {`<< Go Home`}
        </Button>
      </VStack>
    </div>
  )
}
