export type TransferType = "debit" | "credit";
export type TransactionType =
    | "NIP_Transfer"
    | "Book_Transfer"
    | "Investment_Transfer";
export type TransactionStatus = "PENDING" | "FAILED" | "COMPLETED";

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    reference: string;
    narration?: string;
    fee?: number;
    transfer_type: TransferType;
    transaction_type: TransactionType;
    balance_before?: number;
    balance_after?: number;
    currency?: "NGN"; 
    summary?: string;
    sender?: Record<string, any>;
    recipient: Record<string, any>;
    meta_data?: Record<string, any>;
    session_id?: string;
    amount: number;
    payment_amount?: number; 
    initiated_at: Date;
    completed_at?: Date;
    status: TransactionStatus;
    failure_reason?: string;
    channel?: string; 
    external_reference?: string;
    created_at: Date;
    updated_at: Date;
}
