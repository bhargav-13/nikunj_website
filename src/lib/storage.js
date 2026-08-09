const TRANSACTIONS_KEY = 'expense-tracker:transactions'
const LAST_PERSON_KEY = 'expense-tracker:last-person'

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function loadLastPerson() {
  return localStorage.getItem(LAST_PERSON_KEY)
}

export function saveLastPerson(personId) {
  localStorage.setItem(LAST_PERSON_KEY, personId)
}
