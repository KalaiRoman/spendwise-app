import { configureStore } from "@reduxjs/toolkit";
import rootReducers from "../reducers";

const Store = configureStore({
    reducer: rootReducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default Store;