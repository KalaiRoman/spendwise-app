import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google';

function GoogleauthProvider({ children }) {
    return (
        <div>
            <GoogleOAuthProvider clientId="495269381718-bsv9chpesrcqjfu3r6sjibrn4fr7kur3.apps.googleusercontent.com">
                {children}
            </GoogleOAuthProvider>
        </div>
    )
}

export default GoogleauthProvider
