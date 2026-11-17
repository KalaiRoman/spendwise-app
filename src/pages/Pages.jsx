import { lazy } from "react";

const Login = lazy(() => import("../features/auth/Login"));
const Signup = lazy(() => import("../features/auth/Signup"));
const ForgetPassword = lazy(() => import("../features/auth/ForgetPassword"));
const Changepassword = lazy(() => import("../features/auth/ChangePassword"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const Profile = lazy(() => import("../features/auth/Login"));

export { Login, Signup, ForgetPassword, Changepassword, Dashboard, Profile }