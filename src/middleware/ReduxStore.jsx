import { Provider } from 'react-redux'
import Store from '../reuseable/redux/store/Store'
function ReduxStore({ children }) {
    return (
        <Provider store={Store}>
            {children}
        </Provider>
    )
}
export default ReduxStore
