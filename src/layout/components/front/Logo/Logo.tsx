// Logo.tsx
import Image from 'next/image'
import NextLink from 'next/link'

const Logo = () => {
  return (
    <NextLink href='/' style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
      <Image 
        src='/images/logos/Carnix.png' 
        alt='logo' 
        width={40} 
        height={40} 
      />
    </NextLink>
  )
}

export default Logo
