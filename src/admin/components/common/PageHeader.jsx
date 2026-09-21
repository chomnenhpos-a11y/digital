import React from 'react'

export default function PageHeader({title, description}) {
  return (
    <>
        <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    </>
  )
}
