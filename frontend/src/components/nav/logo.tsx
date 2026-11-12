"use client"

import Image from "next/image"

export function Logo() {
  return <>
    <Image
            src="/light-logo.png"
            width={81}
            height={43}
            alt="Logo"
            priority
            className="dark:hidden"
          />
          <Image
            src="/dark-logo.png"
            width={81}
            height={43}
            alt="Logo"
            aria-hidden
            priority
            className="hidden dark:block"
          />
  </>
}
