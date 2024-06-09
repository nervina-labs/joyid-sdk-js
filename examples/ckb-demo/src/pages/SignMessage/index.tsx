/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Button, Textarea, VStack, useToast, Box } from '@chakra-ui/react'
import {
  verifySignature,
  signChallenge,
  type SignChallengeResponseData,
} from '@joyid/ckb'
import { atom, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAccount } from '../../hooks'
import { RoutePath } from '../../route/path'

const messageAtom = atom<string>('Hello World')
const signatureAtom = atom<string>('')
const responseAtom = atom<SignChallengeResponseData | null>(null)

const useHandleResult = () => {
  const toast = useToast()
  const setMessage = useUpdateAtom(messageAtom)
  const setSignature = useUpdateAtom(signatureAtom)
  const setResponse = useUpdateAtom(responseAtom)
  return (res: SignChallengeResponseData | null, error: any) => {
    if (res != null) {
      setMessage(res.challenge)
      setSignature(res.signature)
      setResponse(res)
      return
    }
    if (error != null) {
      toast({
        title: 'Error',
        description: JSON.stringify(error.message),
        status: 'error',
      })
    }
  }
}

export const VerifyButton: React.FC = () => {
  const [response] = useAtom(responseAtom)
  const verify = async () => {
    if (response == null) {
      return
    }
    const result = await verifySignature(response)

    alert(result)
  }

  return (
    <Button
      colorScheme="teal"
      w="240px"
      variant="outline"
      isDisabled={!response?.signature}
      onClick={verify}>
      Verify Message
    </Button>
  )
}

export function SignMessage() {
  const [message, setMessage] = useAtom(messageAtom)
  const [signature, setSignature] = useAtom(signatureAtom)
  const [response, setResponse] = useAtom(responseAtom)
  const [isLoading, setIsLoading] = useState(false)
  const account = useAccount()
  const navi = useNavigate()
  const handleResult = useHandleResult()

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />
  }

  const onPopupClick = async () => {
    setIsLoading(true)
    try {
      const res = await signChallenge(message, account.address)
      handleResult(res, null)
    } catch (error) {
      handleResult(null, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="App">
      <VStack spacing={6}>
        <Textarea
          value={message}
          name="message"
          placeholder="The message to be signed"
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          isDisabled={response != null}
        />
        <Textarea
          value={signature}
          name="signature"
          isDisabled
          placeholder="Signature"
        />
        {response ? (
          <Box maxW="calc(100%)">
            <details>
              <summary>More Details</summary>
              <pre>
                <code
                  style={{
                    whiteSpace: 'pre-wrap',
                  }}>
                  {JSON.stringify(response, null, 4)}
                </code>
              </pre>
            </details>
          </Box>
        ) : null}
        <Button
          onClick={onPopupClick}
          colorScheme="teal"
          w="240px"
          isLoading={isLoading}>
          SignMessage
        </Button>
        <VerifyButton />
        <Button
          colorScheme="red"
          w="240px"
          variant="outline"
          onClick={() => {
            setSignature('')
            setMessage('')
            setResponse(null)
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
