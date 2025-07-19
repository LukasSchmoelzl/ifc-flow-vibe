import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"
import { formatKeyCombination } from "./keyboard-shortcuts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse tutorial step strings and safely render keyboard shortcuts
export function parseTutorialStep(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  const regex = /<kbd>(.*?)<\/kbd>/g
  let lastIndex = 0
  let match
  let keyIndex = 0
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }
    result.push(
      <kbd key={keyIndex++}>{formatKeyCombination(match[1])}</kbd>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }
  return result
}
