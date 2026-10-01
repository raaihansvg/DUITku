import { z } from 'zod'

export const budgetSchema = z.object({
  month: z.coerce
    .number({ message: 'Bulan harus berupa angka' })
    .int()
    .min(1, 'Bulan tidak valid')
    .max(12, 'Bulan tidak valid'),

  year: z.coerce
    .number({ message: 'Tahun harus berupa angka' })
    .int()
    .min(2000, 'Tahun minimal 2000')
    .max(2100, 'Tahun maksimal 2100'),

  amount: z.coerce
    .number({ message: 'Nominal harus berupa angka' })
    .positive('Nominal harus lebih dari 0'),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
