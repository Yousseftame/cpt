import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import NotFound from "./Pages/NotFound/NotFound";
import Login from "./Pages/Auth/Login/Login";
import ForgetPassword from "./Pages/Auth/ForgetPassword/ForgetPassword";
import MasterLayout from "./layouts/MasterLayout/MasterLayout";
import Dashboard from "./Pages/Dashbaord/Dashboard";
import { Toaster } from "react-hot-toast";
import ResetPassword from "./Pages/Auth/ResetPassword/ResetPassword";
import Request from "./Pages/Admin/Request/Request";
import Ticket from "./Pages/Admin/Ticket/Ticket";
import AdminRole from "./Pages/Admin/AdminRole/AdminRole";
import Register from "./Pages/Auth/Register/Register";
import VerifyAccount from "./Pages/Auth/VerifyAccount/VerifyAccount";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Unauthorized from "./Pages/Unauthorized/Unauthorized";
import AddGenerator from "./Pages/Admin/Model/AddGenerator";
import GeneratorList from "./Pages/Admin/Model/GeneratorList";
import EditGenerator from "./Pages/Admin/Model/EditGenerator";
import ViewGeneratorDetails from "./Pages/Admin/Model/ViewGeneratorDetails";
import CreateCustomer from "./Pages/Admin/Customer/CreateCustomer";
import CustomersList from "./Pages/Admin/Customer/CustomersList";
import CustomerDetails from "./Pages/Admin/Customer/CustomerDetails";
import CustomerTickets from "./Pages/Admin/Customer/CustomerTickets";
import PurchaseRequests from "./Pages/Admin/Request/PurchaseRequests";
import RequestDetails from "./Pages/Admin/Request/RequestDetails";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <AuthLayout />,
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
      path: "/unauthorized",
      element: <Unauthorized />,
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
          path: "dashboard", 
          element: (
            <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
              <Dashboard />
            </ProtectedRoute>
          )
        },

        // Customer routes
        { path: "customers", element: <CreateCustomer /> },
        { path: "customer", element: <CustomersList /> },
        { path: "customer/:id", element: <CustomerDetails /> },
        { path: "/customer/:id/tickets", element: <CustomerTickets /> },

        // Model/Generator routes
       
        { path: "/models/add", element: <AddGenerator /> },
        { path: "/models", element: <GeneratorList /> },
        { path: "/models/view/:id", element: <ViewGeneratorDetails /> },
        { path: "/models/edit/:id", element: <EditGenerator /> },

        // Request routes
        { path: "request", element: <Request /> },
        { path: "/requests", element: <PurchaseRequests /> },
        { path: "/requests/:id", element: <RequestDetails /> },

        // Ticket route
        { path: "ticket", element: <Ticket /> },

        // Admin Role (Super Admin only)
        {
          path: "adminRole", 
          element: (
            <ProtectedRoute allowedRoles={["superAdmin"]}>
              <AdminRole />
            </ProtectedRoute>
          )
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
    </>
  );
}

export default App;