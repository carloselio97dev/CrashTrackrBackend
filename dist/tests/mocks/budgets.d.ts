export declare const budgets: {
    id: number;
    name: string;
    amount: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    expenses: {
        id: number;
        name: string;
        amount: number;
        budgetId: number;
        createdAt: string;
        updatedAt: string;
    }[];
}[];
