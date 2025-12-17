import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import NotFound from "./Pages/NotFound/NotFound";
import Login from "./Pages/Auth/Login/Login";
import ForgetPassword from "./Pages/Auth/ForgetPassword/ForgetPassword";
import MasterLayout from "./layouts/MasterLayout/MasterLayout";
import Dashboard from "./Pages/Dashbaord/Dashboard";
import { Toaster } from "react-hot-toast";
import ResetPassword from "./Pages/Auth/ResetPassword/ResetPassword";
// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Customer from "./Pages/Admin/Customer/Customer";
import Model from "./Pages/Admin/Model/Model";
import Request from "./Pages/Admin/Request/Request";
import Ticket from "./Pages/Admin/Ticket/Ticket";
import AdminRole from "./Pages/Admin/AdminRole/AdminRole";
import Register from "./Pages/Auth/Register/Register";
import VerifyAccount from "./Pages/Auth/VerifyAccount/VerifyAccount";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Unauthorized from "./Pages/Unauthorized/Unauthorized";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthLayout />
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Login /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "forget-password", element: <ForgetPassword /> },
        { path: "verify-account", element: <VerifyAccount /> },
      ],
    },
    {
      path: "",
      element: (

        <ProtectedRoute>
          <MasterLayout />
        </ProtectedRoute>

      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Dashboard /> },
        {
          path: "dashboard", element: <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
            <Dashboard />
          </ProtectedRoute>
        },

        // Manager routes
        { path: "customer", element: <Customer /> },
        { path: "model", element: <ProtectedRoute allowedRoles={["admin"]}><Model /></ProtectedRoute> },
        { path: "request", element: <Request /> },
        { path: "ticket", element: <Ticket /> },
        {
          path: "adminRole", element: <ProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminRole />
          </ProtectedRoute>
        },
        { path: "/unauthorized", element: <Unauthorized /> },


      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={routes}></RouterProvider>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
    </>
  );
}

export default App;
