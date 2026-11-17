import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from '../routes/Routes'

function RouterProviders({ children }) {
    return (
        <RouterProvider router={router}>
            {children}
        </RouterProvider>
    )
}

export default RouterProviders
