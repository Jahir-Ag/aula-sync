'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExpandableDescriptionProps {
  text: string | undefined
  maxLines?: number
}

export function ExpandableDescription({ text, maxLines = 2 }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  const lines = text.split('\n').length
  const isLong = lines > maxLines || text.length > 150

  if (!isLong) {
    return <p className="text-sm mt-0.5 text-gray-500">{text}</p>
  }

  return (
    <div
      className="mt-0.5 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
    >
      <p
        className={`text-sm text-gray-500 transition-all ${
          isExpanded ? '' : 'line-clamp-2'
        }`}
      >
        {text}
      </p>
      {!isExpanded && (
        <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
          Ver más <ChevronDown className="w-3 h-3" />
        </p>
      )}
      {isExpanded && (
        <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
          Ver menos <ChevronDown className="w-3 h-3 rotate-180" />
        </p>
      )}
    </div>
  )
}
