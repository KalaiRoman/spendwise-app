import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReduxStore from './middleware/ReduxStore.jsx'
import GoogleauthProvider from './middleware/GoogleauthProvider.jsx'
createRoot(document.getElementById('root')).render(
  <ReduxStore>
    <GoogleauthProvider>
      <App />
    </GoogleauthProvider>
  </ReduxStore>,
)
