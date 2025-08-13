import TransactionDetails from "@/apps/dashboard/banking/transactions/TransactionDetails";
import Transactions from "@/apps/dashboard/banking/transactions/Transactions";
import CustomerDetails from "@/apps/dashboard/customers/CustomerDetails";
import CustomersPage from "@/apps/dashboard/customers/Customers";
import AppLayout from "@/layout/AppLayout";
import { Route, Routes } from "react-router";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/app" element={<AppLayout />}>
        <Route path="customers/">
          <Route index element={<CustomersPage />} />
          <Route path=":customerId" element={<CustomerDetails />} />
        </Route>
        <Route path="transactions/">
          <Route index element={<Transactions />} />
          <Route path=":customerId" element={<TransactionDetails />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
