export interface Pagination {
  currentPage: number;
  limitPerPage: number;
  totalItems: number;
  previousPage: number | null;
  nextPage: number | null;
}

export interface MonthlyClosingFilters {
  page?: number;
  limit?: number;
  startDate?: string; // formato: 2024-03-02
  endDate?: string;
}

export interface ExpenseType {
  id: string;
  name: string;
}

export interface PersonalExpense {
  id: string;
  name: string;
  description: string;
  value: number;
  expenseType: ExpenseType;
}

export interface OperacionalPj {
  id: string;
  accountFee: number;
  individualContribution: number;
  totalInvoiceTax: number;
}

export interface MonthlyClosing {
  id: string;
  closingDate: string;
  amountCollected: number;
  isClosing: boolean;
  operacionalPj: OperacionalPj | null;
  personalExpense: PersonalExpense[] | [];
}

export interface MonthlyClosingResponse {
  data: MonthlyClosing[];
  pagination: Pagination;
}

// export interface CreateMonthlyClosing {
//   closingDate: string;
//   amountCollected: number;
//   operacionalPj: OperacionalPj | null;
//   personalExpense: PersonalExpense[] | [];
// }
export interface CreateMonthlyClosing {
  closingDate: string;
  amountCollected: number;
  operacionalPj?: {
    accountFee: number;
    individualContribution: number;
    totalInvoiceTax: number;
  };
  personalExpense?: {
    description: string;
    value: number;
    expenseTypeId: string;
  }[];
}

export interface UpdateMonthlyClosing {
  closingDate?: string;
  amountCollected?: number;
  isClosing?: boolean;
  operacionalPj?: {
    accountFee: number;
    individualContribution: number;
    totalInvoiceTax: number;
  };
  personalExpense?: {
    description: string;
    value: number;
    expenseTypeId: string;
  }[];
}