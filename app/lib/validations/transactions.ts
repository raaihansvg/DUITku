import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Pilih tipe transaksi",
  }),
  
  amount: z.coerce
    .number({
      message: "Nominal harus berupa angka",
    })
    .positive("Nominal harus lebih dari 0"),
    
  category: z.string().min(1, "Pilih kategori"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;