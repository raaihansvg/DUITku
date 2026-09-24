import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT NOW()");
  return Response.json({ ok: true, time: result.rows[0].now });
}
