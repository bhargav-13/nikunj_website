import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
} from 'date-fns'

export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

export function todayKey() {
  return toDateKey(new Date())
}

export function formatDisplayDate(dateKey) {
  return format(parseDateKey(dateKey), 'd MMM yyyy')
}

export function formatDayLabel(dateKey) {
  const today = todayKey()
  const yesterday = toDateKey(subDays(new Date(), 1))
  if (dateKey === today) return 'Today'
  if (dateKey === yesterday) return 'Yesterday'
  return format(parseDateKey(dateKey), 'EEEE, d MMM yyyy')
}

export function formatCreatedAt(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return format(d, 'd MMM yyyy, h:mm a')
}

export function formatCreatedAtTime(isoString) {
  if (!isoString) return ''
  return format(new Date(isoString), 'h:mm a')
}

function dateKeyInInterval(dateKey, interval) {
  return isWithinInterval(startOfDay(parseDateKey(dateKey)), interval)
}

export function getPeriodRanges(reference = new Date()) {
  const dayStart = startOfDay(reference)
  return {
    today: { start: dayStart, end: dayStart },
    week: {
      start: startOfWeek(reference, { weekStartsOn: 1 }),
      end: endOfWeek(reference, { weekStartsOn: 1 }),
    },
    month: { start: startOfMonth(reference), end: endOfMonth(reference) },
  }
}

export function sumByPeriod(transactions, type, reference = new Date()) {
  const ranges = getPeriodRanges(reference)
  const totals = { today: 0, week: 0, month: 0 }

  for (const tx of transactions) {
    if (tx.type !== type) continue
    for (const key of Object.keys(ranges)) {
      if (dateKeyInInterval(tx.date, ranges[key])) {
        totals[key] += tx.amount
      }
    }
  }

  return totals
}

export function sumLastNDays(transactions, type, days, reference = new Date()) {
  const interval = { start: startOfDay(subDays(reference, days - 1)), end: startOfDay(reference) }
  return transactions
    .filter((tx) => tx.type === type && dateKeyInInterval(tx.date, interval))
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function groupByDate(transactions) {
  const groups = new Map()
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
  for (const tx of sorted) {
    if (!groups.has(tx.date)) groups.set(tx.date, [])
    groups.get(tx.date).push(tx)
  }
  return [...groups.entries()]
}
