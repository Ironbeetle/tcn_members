'use client'
import { useState } from "react"
import Link from "next/link"
import { Backbtn } from "./Backbtn"

interface MenuItem {
  label: string
  to: string
  color?: "emerald" | "stone" | "amber" | "red"
}

interface HamburgerProps {
  menuItems?: MenuItem[]
  showBackButton?: boolean
}

export const Hamburger = ({ 
  menuItems = [], 
  showBackButton = true 
}: HamburgerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const getButtonStyles = (color: MenuItem["color"] = "emerald") => {
    const colorMap = {
      emerald: "bg-emerald-600 hover:bg-emerald-700",
      stone: "bg-stone-600 hover:bg-stone-700", 
      amber: "bg-amber-600 hover:bg-amber-700",
      red: "bg-red-600 hover:bg-red-700"
    }
    return `${colorMap[color]} text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105`
  }

  return (
    <div className="lg:hidden">
      <div className="relative p-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 flex flex-col justify-center space-y-1 z-20 relative"
        >
          <span className={`block w-8 h-1 bg-emerald-700 rounded-sm transform transition duration-300 ${isOpen ? 'rotate-45 translate-y-2 bg-white' : ''}`}></span>
          <span className={`block w-8 h-1 bg-emerald-700 rounded-sm transition duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-8 h-1 bg-emerald-700 rounded-sm transform transition duration-300 ${isOpen ? '-rotate-45 -translate-y-2 bg-white' : ''}`}></span>
        </button>
        
        <ul 
          className={`fixed top-0 left-0 w-screen h-screen bg-stone-900/95 backdrop-blur-sm flex flex-col justify-center items-center space-y-8 transition-transform duration-300 z-50 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={() => setIsOpen(false)} // Close when clicking anywhere on overlay
        >
          {showBackButton && (
            <li className="flex flex-col justify-center items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
                <Backbtn />
              </div>
            </li>
          )}
          
          {menuItems.map((item, index) => (
            <li key={index} className="flex flex-col justify-center items-center">
              <Link href={item.to} className="block">
                <div className={getButtonStyles(item.color)}>
                  <div className="font-medium text-center whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}