'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExpandableDescriptionProps {
  text: string | undefined
  maxChars?: number
}

export function ExpandableDescription({
  text,
  maxChars = 150,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  const normalizedText = text.trim()
  const isLong = normalizedText.length > maxChars
  const collapsedText = isLong
    ? `${normalizedText.slice(0, maxChars).trimEnd()}...`
    : normalizedText

  if (!isLong) {
    return (
      <p className="mt-1 overflow-hidden text-justify text-sm text-gray-500 [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-line">
        {collapsedText}
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsExpanded((prev) => !prev)}
      className="mt-1 block w-full text-left"
      aria-expanded={isExpanded}
    >
      <p
        className={`overflow-hidden text-justify text-sm text-gray-500 [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-line ${
          isExpanded ? '' : 'line-clamp-1'
        }`}
      >
        {isExpanded ? normalizedText : collapsedText}
      </p>
      <span className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-500">
        {isExpanded ? 'Ver menos' : 'Ver más'}
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </span>
    </button>
  )
}
