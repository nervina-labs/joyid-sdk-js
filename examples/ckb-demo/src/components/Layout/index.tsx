import styled from '@emotion/styled'
import { Outlet } from 'react-router-dom'

const Container = styled('main')`
  width: 100%;
  position: relative;
  max-width: 500px;
  min-height: 100vh;
  padding: 20px;
`

export const Layout: React.FC = () => (
  <Container>
    <Outlet />
  </Container>
)
