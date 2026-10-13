// src/components/Link.tsx
// wrapper روی Next.js Link برای استفاده یکپارچه در پروژه

import NextLink from 'next/link'
import type { ComponentProps } from 'react'

type LinkProps = ComponentProps<typeof NextLink>

export const Link = (props: LinkProps) => {
  return <NextLink {...props} />
}
