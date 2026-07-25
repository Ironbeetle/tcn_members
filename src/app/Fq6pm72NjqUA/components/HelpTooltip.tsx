'use client'

/**
 * HelpTooltip Component
 * 
 * Small inline (?) icon that shows a tooltip on hover/click.
 * Use next to form fields or UI elements that need brief explanation.
 */

import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  text: string
  size?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function HelpTooltip({ text, size = 14, position = 'top' }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visible])

  return (
    <span className="help-tooltip-wrapper">
      <button
        ref={triggerRef}
        type="button"
        className="help-tooltip-trigger"
        onClick={() => setVisible(!visible)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label="Help"
      >
        <HelpCircle size={size} />
      </button>
      {visible && (
        <div
          ref={tooltipRef}
          className={`help-tooltip-bubble help-tooltip-${position}`}
          role="tooltip"
        >
          {text}
        </div>
      )}
    </span>
  )
}
