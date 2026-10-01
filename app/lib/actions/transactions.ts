"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import db from "@/app/lib/db";
import { transactionSchema, type TransactionFormValues } from "@/app/lib/validations/transactions";

export async function createTransaction(data: TransactionFormValues) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { error: "Unauthorized" };
    }

    const validatedData = transactionSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: "Invalid data" };
    }

    const { type, amount, category, description, date } = validatedData.data;

    await db.query(
      `INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session.userId,
        type.toLowerCase(),
        amount,
        category,
        description || null,
        date,
      ]
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { error: "Failed to create transaction" };
  }
}

export async function deleteTransaction(id: number) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { error: "Unauthorized" };
    }

    await db.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, session.userId]
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { error: "Failed to delete transaction" };
  }
}

export async function getTransactions() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return [];
    }

    const result = await db.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC, created_at DESC`,
      [session.userId]
    );

    return result.rows;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getFinancialSummary() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { totalIncome: 0, totalExpense: 0, balance: 0 };
    }

    const result = await db.query(
      `SELECT type, SUM(amount) as total FROM transactions WHERE user_id = $1 GROUP BY type`,
      [session.userId]
    );

    let totalIncome = 0;
    let totalExpense = 0;

    result.rows.forEach((row) => {
      const amount = parseFloat(row.total);
      if (row.type === 'income') {
        totalIncome += amount;
      } else if (row.type === 'expense') {
        totalExpense += amount;
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return { totalIncome: 0, totalExpense: 0, balance: 0 };
  }
}
