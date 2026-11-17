import { createBrowserRouter } from "react-router";
import { Changepassword, Dashboard, ForgetPassword, Login, Signup } from "../pages/Pages";
import ProtectedRouterWithoutToken from "./ProtectedRouterWithoutToken";
import ProtectedRouter from "./ProtectedRouter";
const router = createBrowserRouter([
    {
        element: <ProtectedRouterWithoutToken />,
        children: [
            {
                path: "/",
                element: <Login />
            },
            {
                path: "/signup",
                element: <Signup />
            },
            {
                path: "/forget-password",
                element: <ForgetPassword />
            },
            {
                path: "/change-password",
                element: <Changepassword />,
            },
        ]
    },
    {
        element: <ProtectedRouter />,
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />
            }
        ]

    }
]);


export default router;