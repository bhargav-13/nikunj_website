export const MATERIAL_TYPES = [
  { id: 'cement', label: 'Cement', units: ['bag', 'kg'] },
  { id: 'reti', label: 'Reti', units: ['kg', 'brass', 'ton'] },
  { id: 'kapachi', label: 'Kapachi', units: ['kg', 'brass', 'ton'] },
  { id: 'lokhand', label: 'Lokhand', units: ['kg', 'ton'] },
  { id: 'eet', label: 'Eet', units: ['pcs'] },
]

export function materialById(id) {
  return MATERIAL_TYPES.find((m) => m.id === id) ?? null
}

export function defaultUnitFor(materialId) {
  return materialById(materialId)?.units[0] ?? ''
}
