import { configureStore } from "@reduxjs/toolkit";
import { usersApi } from '../features/apiSlice3';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
    reducer: {
        [usersApi.reducerPath]: usersApi.reducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(usersApi.middleware),
    devTools: true
})

setupListeners(store.dispatch);