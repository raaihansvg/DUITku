// Event browser yang dikirim setiap kali transaksi ditambah, diubah, atau dihapus.
// Didengarkan oleh SummarySection dan BudgetCard supaya ikut diperbarui tanpa reload.
export const TRANSACTION_CHANGED = 'transaction:changed'

export function notifyTransactionChanged() {
  window.dispatchEvent(new Event(TRANSACTION_CHANGED))
}
