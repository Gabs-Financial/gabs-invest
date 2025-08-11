import { ColumnDef } from "@tanstack/react-table";

export type Customer = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const CustomerColumns:ColumnDef<Customer> = {
    
}