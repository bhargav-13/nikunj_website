export const PERSONS = [
  { id: 'nikunj', name: 'Nikunj' },
  { id: 'mansukhmasa', name: 'Mansukhmasa' },
]

export const EXPENSE_CATEGORIES = [
  { id: 'labor', label: 'Labor', color: 'var(--cat-labor)' },
  { id: 'material', label: 'Material', color: 'var(--cat-material)' },
  { id: 'transport', label: 'Transport', color: 'var(--cat-transport)' },
  { id: 'fuel', label: 'Fuel', color: 'var(--cat-fuel)' },
  { id: 'equipment', label: 'Equipment Rent', color: 'var(--cat-equipment)' },
  { id: 'food', label: 'Food', color: 'var(--cat-food)' },
  { id: 'other', label: 'Other', color: 'var(--cat-other)' },
]

export function categoryById(id) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

export function personById(id) {
  return PERSONS.find((p) => p.id === id) ?? null
}
