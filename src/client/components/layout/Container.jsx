import React from 'react'

export default function Container({children , className=''}) {
  return (
    <div className={`w-full max-w-[1240px] mx-auto px-4 sm:px-14 lg:px-6 ${className}`}>
      {children}
    </div>
  )
}
