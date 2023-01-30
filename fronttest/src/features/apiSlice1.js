import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const usersApi = createApi({
    // The reducerPath is a unique key that your service will be mounted to in your store. 
    reducerPath: "usersApi",

    // The base query used by each endpoint if no queryFn option is specified.
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3500/" }) ,

    // Endpoints are just a set of operations that you want to perform against your server. 
    // You define them as an object using the builder syntax. 
    // There are two basic endpoint types: query and mutation.
    endpoints: (builder) => ({ 
            getAllUsers: builder.query({
                query: () => "users", 
            })
        })
    })

export const { useGetAllUsersQuery } = usersApi

/*
   createApi
   https://redux-toolkit.js.org/rtk-query/api/createApi

   RTK Query Tutorial - How to Fetch Data With Redux Toolkit Query | React Beginners Tutorial
   https://youtu.be/-8WEd578fFw
*/