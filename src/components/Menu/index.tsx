import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

import { Avatar } from '../Avatar'

import { ChartLineUp, Binoculars, SignIn, User } from '@phosphor-icons/react'
import {
  MenuLink,
  MenuContainer,
  MenuList,
  MenuSignInButton,
  MenuSignOutButton,
} from './styles'
import Link from 'next/link'

export function Menu() {
  const router = useRouter()
  const { status, data } = useSession()

  const { pathname } = router
  const isRouteActive = pathname.split('/')

  async function handleSignOut() {
    await signOut({
      callbackUrl: 'http://localhost:3000/',
    })
  }

  return (
    <MenuContainer>
      <Image src={'/images/logo.png'} height={32} width={128} alt="Book Wise" />

      <MenuList>
        <MenuLink
          href={'/home'}
          className={isRouteActive.includes('home') ? 'active' : ''}
        >
          <ChartLineUp size={24} />
          Início
        </MenuLink>

        <MenuLink
          href={'/explore'}
          className={isRouteActive.includes('explore') ? 'active' : ''}
        >
          <Binoculars size={24} />
          Explorar
        </MenuLink>

        {status === 'authenticated' && (
          <MenuLink
            href={`/profile/${data.user.id}`}
            className={isRouteActive.includes('profile') ? 'active' : ''}
          >
            <User size={24} />
            Perfil
          </MenuLink>
        )}
      </MenuList>

      {status === 'authenticated' ? (
        <MenuSignOutButton onClick={handleSignOut}>
          <Avatar avatarUrl={data.user.avatar_url} username={data.user.name} />
          <span>{data.user.name}</span>
          <SignIn size={20} color="#F75A68" weight="bold" />
        </MenuSignOutButton>
      ) : (
        <MenuSignInButton as={Link} href="/">
          <span>Fazer Login</span>
          <SignIn size={20} color="#7FD1CC" weight="bold" />
        </MenuSignInButton>
      )}
    </MenuContainer>
  )
}
