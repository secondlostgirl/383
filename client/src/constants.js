// Must match SPECIALIST_TYPES in server/src/db/schema.js (assignment §3.1).
export const SPECIALIST_TYPES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'special_education_teacher', label: 'Special education teacher' },
  { value: 'coach', label: 'Coach' },
]

export function specialistTypeLabel(value) {
  return SPECIALIST_TYPES.find((t) => t.value === value)?.label ?? value
}
