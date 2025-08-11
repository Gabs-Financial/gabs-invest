
import LoginPage from "@/apps/auth/Login";
import Register from "@/apps/auth/Register";
import VerifyEmail from "@/apps/auth/VerifyEmail";
import AuthLayout from "@/layout/AuthLayout";
import { Route, Routes } from "react-router";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/"  element={<AuthLayout/>}>
        <Route index element={<LoginPage/>} />
        <Route path="register" element={<Register/>} />
        <Route path="verify_email" element={<VerifyEmail/>} />

      </Route>
    </Routes>
  );
};

export default AuthRoutes;
