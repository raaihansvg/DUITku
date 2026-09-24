export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export const CATEGORIES = {
  INCOME: [
    'Uang Saku',
    'Gaji',
    'Freelance',
    'Bonus',
    'Lainnya',
  ],
  EXPENSE: [
    'Makanan',
    'Transportasi',
    'Kebutuhan Kuliah',
    'Tagihan',
    'Hiburan',
    'Belanja',
    'Lainnya',
  ],
} as const;