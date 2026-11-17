import React from 'react'
import { getToken } from '../utils/Token'
import { Navigate, Outlet } from 'react-router-dom';
function ProtectedRouter() {
    const token = getToken();
    return token ? <Outlet /> : <Navigate to="/dashboard" replace={true} />
}

export default ProtectedRouter
