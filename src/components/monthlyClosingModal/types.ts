export type ExpenseItem = {
  name: string;
  description: string;
  expenseType: { id: string; name: string };
  value: string;
};

export type InvoiceItem = {
  id?: string;
  value: string;
};
