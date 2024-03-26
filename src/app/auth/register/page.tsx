import { Metadata } from 'next'
import LogoutPageContent from './content'
import LoginHome from './content'

export const metadata: Metadata = {
  title: 'Kippa - Create account',
  description: 'Kippa learning',
}

export default async function Login () {
  return <LoginHome />
}
