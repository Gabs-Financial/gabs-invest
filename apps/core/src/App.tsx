import { BrowserRouter } from "react-router";
import AuthRoutes from "./routes/AuthRoutes";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthProvider";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthRoutes />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
