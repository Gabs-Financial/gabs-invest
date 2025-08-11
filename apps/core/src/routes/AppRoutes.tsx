import CustomersPage from "@/apps/dashboard/customers/Customers";
import AppLayout from "@/layout/AppLayout";
import { Route, Routes } from "react-router";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/app" element={<AppLayout />}>
        <Route path="customers" element={<CustomersPage />}/>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
