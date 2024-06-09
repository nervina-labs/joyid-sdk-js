import { useState } from 'react'
import { Button, VStack, useToast } from '@chakra-ui/react'
import { connect } from '@joyid/ckb'
import { Navigate } from 'react-router-dom'
import { useAccount, useSetAccountInfo } from '../../hooks'
import { RoutePath } from '../../route/path'

export function Root() {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const setAccount = useSetAccountInfo()
  const account = useAccount()

  const onPopupClick = async () => {
    setIsLoading(true)
    try {
      const res = await connect()
      setAccount({
        ...res,
        callbackType: 'popup',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (account) {
    return <Navigate to={RoutePath.Home} replace />
  }

  return (
    <div className="App">
      <VStack spacing={6} mt="200px">
        <Button
          onClick={onPopupClick}
          colorScheme="teal"
          w="200px"
          isLoading={isLoading}>
          Connect JoyID
        </Button>
      </VStack>
    </div>
  )
}
