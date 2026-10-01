import { z } from "zod";
import { CATEGORIES } from "@/app/lib/constants";

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"], {
      message: "Pilih tipe transaksi",
    }),

    amount: z.coerce
      .number({
        message: "Nominal harus berupa angka",
      })
      .positive("Nominal harus lebih dari 0")
      .max(999_999_999_999, "Nominal terlalu besar"),

    category: z.string().min(1, "Pilih kategori"),
    description: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
    date: z
      .string()
      .min(1, "Tanggal wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal tidak valid"),
  })
  .superRefine((data, ctx) => {
    // Kategori harus sesuai dengan tipe transaksi yang dipilih
    const allowed: readonly string[] = CATEGORIES[data.type];
    if (!allowed.includes(data.category)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Kategori tidak valid" });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
