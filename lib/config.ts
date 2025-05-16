// T-shirt size to hours mapping
export const sizeMap: Record<string, number> = {
  XS: 4,
  S: 8,
  M: 16,
  L: 24,
  XL: 32,
}

// T-shirt size to cost mapping
export const costMap: Record<string, number> = {
  XS: 100,
  S: 200,
  M: 400,
  L: 600,
  XL: 800,
}

// List of holidays (can be configured)
export const holidays: Date[] = [
  new Date(2025, 0, 1), // New Year's Day
  new Date(2025, 0, 20), // Martin Luther King Jr. Day
  new Date(2025, 1, 17), // Presidents' Day
  new Date(2025, 4, 26), // Memorial Day
  new Date(2025, 6, 4), // Independence Day
  new Date(2025, 8, 1), // Labor Day
  new Date(2025, 10, 11), // Veterans Day
  new Date(2025, 10, 27), // Thanksgiving
  new Date(2025, 11, 25), // Christmas
]
