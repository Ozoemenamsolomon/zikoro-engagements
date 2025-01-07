"use client"

import Image from "next/image"

export default function SideNav() {
  return (
    <div className="w-[200px] sm:w-[250px] py-3">
      <div className="px-3 mb-8">
        <Image src="/logo.png" alt="logo" width={150} height={60}/>
      </div>
      <div className="w-full flex flex-col items-start justify-start">

      </div>
    </div>
  )
}
