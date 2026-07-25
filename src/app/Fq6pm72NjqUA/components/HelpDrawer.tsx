'use client'

/**
 * HelpDrawer Component
 * 
 * A slide-out panel triggered by a floating "?" button.
 * Displays contextual help content based on the current route.
 * Remembers dismissed state per-page in localStorage.
 */

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { HelpCircle, X, ChevronDown, ChevronRight, Lightbulb, ListChecks, MessageCircleQuestion } from 'lucide-react'
import { getHelpForRoute, type HelpEntry, type HelpFaq } from '../lib/helpContent'

const STORAGE_KEY = 'tcn_help_dismissed'
const FIRST_VISIT_KEY = 'tcn_help_visited'

function getDismissedPages(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function setDismissedPages(pages: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
}

function getVisitedPages(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FIRST_VISIT_KEY) || '[]')
  } catch {
    return []
  }
}

function markPageVisited(path: string) {
  const visited = getVisitedPages()
  if (!visited.includes(path)) {
    visited.push(path)
    localStorage.setItem(FIRST_VISIT_KEY, JSON.stringify(visited))
  }
}

/** Collapsible FAQ item */
function FaqItem({ faq }: { faq: HelpFaq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="help-faq-item">
      <button
        className="help-faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{faq.question}</span>
      </button>
      {open && <p className="help-faq-answer">{faq.answer}</p>}
    </div>
  )
}

export default function HelpDrawer() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [helpEntry, setHelpEntry] = useState<HelpEntry | null>(null)

  // Load help content when route changes
  useEffect(() => {
    const entry = getHelpForRoute(pathname)
    setHelpEntry(entry)
    setIsOpen(false)

    // Check dismissed state
    const dismissed = getDismissedPages()
    setIsDismissed(dismissed.includes(pathname))

    // Auto-open on first visit to a page that has help
    if (entry) {
      const visited = getVisitedPages()
      if (!visited.includes(pathname) && !dismissed.includes(pathname)) {
        setIsOpen(true)
        markPageVisited(pathname)
      }
    }
  }, [pathname])

  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const dismissForPage = useCallback(() => {
    const dismissed = getDismissedPages()
    if (!dismissed.includes(pathname)) {
      dismissed.push(pathname)
      setDismissedPages(dismissed)
    }
    setIsDismissed(true)
    setIsOpen(false)
  }, [pathname])

  const undismiss = useCallback(() => {
    const dismissed = getDismissedPages().filter(p => p !== pathname)
    setDismissedPages(dismissed)
    setIsDismissed(false)
  }, [pathname])

  // Don't render anything if there's no help for this route
  if (!helpEntry) return null

  return (
    <>
      {/* Floating help button */}
      <button
        className={`help-fab ${isOpen ? 'help-fab-active' : ''} ${isDismissed ? 'help-fab-dimmed' : ''}`}
        onClick={toggleDrawer}
        aria-label="Toggle help panel"
        title="Help"
      >
        <HelpCircle size={22} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="help-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer panel */}
      <aside className={`help-drawer ${isOpen ? 'help-drawer-open' : ''}`}>
        <div className="help-drawer-inner staff-scrollbar">
          {/* Header */}
          <div className="help-drawer-header">
            <div className="help-drawer-title-row">
              <HelpCircle size={18} className="text-staff-accent" />
              <h2 className="help-drawer-title">{helpEntry.title}</h2>
            </div>
            <button
              className="help-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close help panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="help-description">{helpEntry.description}</p>

          {/* Steps */}
          {helpEntry.steps && helpEntry.steps.length > 0 && (
            <div className="help-section">
              <h3 className="help-section-title">
                <ListChecks size={16} />
                How To Use
              </h3>
              <ol className="help-steps">
                {helpEntry.steps.map((step, i) => (
                  <li key={i} className="help-step">
                    <span className="help-step-number">{i + 1}</span>
                    <div>
                      <strong className="help-step-label">{step.label}</strong>
                      <p className="help-step-detail">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips */}
          {helpEntry.tips && helpEntry.tips.length > 0 && (
            <div className="help-section">
              <h3 className="help-section-title">
                <Lightbulb size={16} />
                Tips
              </h3>
              <ul className="help-tips">
                {helpEntry.tips.map((tip, i) => (
                  <li key={i} className="help-tip">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {helpEntry.faqs && helpEntry.faqs.length > 0 && (
            <div className="help-section">
              <h3 className="help-section-title">
                <MessageCircleQuestion size={16} />
                Common Questions
              </h3>
              <div className="help-faqs">
                {helpEntry.faqs.map((faq, i) => (
                  <FaqItem key={i} faq={faq} />
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="help-footer">
            {isDismissed ? (
              <button className="help-dismiss-btn" onClick={undismiss}>
                Show help on this page again
              </button>
            ) : (
              <button className="help-dismiss-btn" onClick={dismissForPage}>
                Don&apos;t show on this page
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
