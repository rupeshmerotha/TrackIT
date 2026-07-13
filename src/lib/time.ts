export function parseTimeInput(input: string): number | null {
  const normalized = input.toLowerCase().trim()
  
  if (!normalized) return null

  // If it's just a number, assume minutes
  if (/^\d+$/.test(normalized)) {
    return parseInt(normalized, 10)
  }

  let totalMinutes = 0

  // Match hours
  const hoursMatch = normalized.match(/(\d+)\s*(h|hr|hrs|hour|hours)/)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60
  }

  // Match minutes
  const minsMatch = normalized.match(/(\d+)\s*(m|min|mins|minute|minutes)/)
  if (minsMatch) {
    totalMinutes += parseInt(minsMatch[1], 10)
  }

  if (totalMinutes === 0) return null

  return totalMinutes
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 h"
  const hours = minutes / 60
  const rounded = Math.round(hours * 10) / 10
  return `${rounded} h`
}
