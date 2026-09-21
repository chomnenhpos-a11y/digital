import React from 'react'

export default function Button({ children, onClick, variant = "primary", className = "", type = "button" }) {
  const base = "px-3 py-0.5 md:px-4 md:py-1.5 rounded-lg font-medium transition-colors"
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 text-slate-900 hover:bg-slate-50",
    white: "bg-white text-red-900 hover:bg-slate-100",
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant] ?? ""} ${className}`}>
      {children}
    </button>
  )
}
