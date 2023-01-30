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

                // In some cases, you may want to manipulate the data returned from a query 
                // before you put it in the cache. (optional)
                transformResponse: (response, meta, arg) => {
                    console.log('transform', response)
                    // clone the response
                    const copy = JSON.parse(JSON.stringify(response))
                    // sort by username 
                    return copy.sort(compare)
               },

               // Used by query endpoints. Determines which 'tag' is attached to the cached data // 
               // returned by the query. (optional)
               providesTags: ['Users']
            })
        })
    })

export const { useGetAllUsersQuery } = usersApi

function compare( a, b ) {
    if ( a.username < b.username ){
        return -1;
    }
    if ( a.username > b.username ){
        return 1;
    }
    return 0;
}

/*
   createApi
   https://redux-toolkit.js.org/rtk-query/api/createApi

   RTK Query Tutorial - How to Fetch Data With Redux Toolkit Query | React Beginners Tutorial
   https://youtu.be/-8WEd578fFw

   Sort array of objects by string property value
   https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value

   Clone An Object In JavaScript: 4 Best Ways [Examples]
   https://www.codingem.com/javascript-clone-object/
*/