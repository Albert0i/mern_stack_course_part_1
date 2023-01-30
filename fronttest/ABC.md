# "The ABC of RTK Query"


## I. Introduction 
Redux toolkit is a state management solution for react and within Redux toolkit there's also the ability to fetch data. 


## II. RTK Query basics
First thing first, create `apiSlice.js` under `features` folder and import `createApi` 
and `fetchBaseQuery` into it. 

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
```

We are going to create a API to fetch a list of users from the backend and then export it, so that we can access it from other files.

```javascript
export const usersApi = createApi({
    reducerPath: "usersApi",

    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3500/" }) ,

    endpoints: (builder) => ({ 
            getAllUsers: builder.query({
                query: () => "users", 
            })
        })
    })
```
`reducer path` just like a namespace, so that you can identify it later and we can call it similar to what we call the name of Api. 

we need to set a `base URL` for which API we're fetching data. 

if we want to have multiple queries as well as add, update and delete. Just put everything inside of `endpoints`. An endpoints is where we're actually going to define all the queries/mutations.  

```javascript
export const { useGetAllUsersQuery } = usersApi
```
Finally, there's a very cool thing that RTK query does, it creates a hook for all queries/mutations inside of your endpoints. The format of the hook is: 
```
use + (Name of query/mutation) + Query/Mutation 
```
you can easily export it. So we can just use it in other files where we want to fetch the data.

component/Data.js
```javascript
import React from 'react'
import { useGetAllUsersQuery } from '../features/apiSlice'

const Data = () => {
  const { data:users, isLoading, isError, error } = useGetAllUsersQuery()
  console.log(users)

  if (isLoading) return <h1>Loading...</h1>
  if (isError) console.log(error)

  return ( 
    <>
      <div>Data</div>
      <ul>
        { users.map(user => <li key={user._id}> {user.username} </li>) }
      </ul>
    </>   
  )
}

export default Data
```


## III. transformResponse & providesTags
In some cases, you may want to manipulate the data returned from a query before you put it in the cache. In this instance, you can take advantage of `transformResponse.`

`providesTags` are used by query endpoints. Determines which 'tag' is attached to the cached data returned by the query. 

```javascript
. . .
  getAllUsers: builder.query({
        query: () => "users", 

        transformResponse: (response, meta, arg) => {
            console.log('transform', response)
            // clone the response
            const copy = JSON.parse(JSON.stringify(response))
            // sort by username 
            return copy.sort(compare)
        },

        providesTags: ['Users']
    }) 
. . .
function compare( a, b ) {
    if ( a.username < b.username ){
        return -1;
    }
    if ( a.username > b.username ){
        return 1;
    }
    return 0;
}
```


## IV. Normaling data 
Many applications deal with data that is nested or relational in nature. Because of this, the recommended approach to managing relational or nested data in a Redux store is to treat a portion of your store as if it were a database, and keep that data in a normalized form.

First, we need to import `createEntityAdapter`. 
```javascript
import { createEntityAdapter } from "@reduxjs/toolkit";
```

Create the adapter 
```javascript 
const usersAdapter = createEntityAdapter({
    // Assume IDs are stored in a field other than `user.id`
    selectId: (user) => user._id, 
    // Keep the "all IDs" array sorted based on username    
    sortComparer: (a, b) => a.username.localeCompare(b.username),
  })

const initialState = usersAdapter.getInitialState() 
```

Fill data into adapter 
```javascript 
      transformResponse: (response, meta, arg) => {
          console.log('transform', response)
          return usersAdapter.setAll(initialState, response)
      },

```
The return data is an object
```javascript 
  {
    // The unique IDs of each item. Must be strings or numbers
    ids: []
    // A lookup table mapping entity IDs to the corresponding entity objects
    entities: {
    }
}
```

```javascript
import React from 'react'
import { useGetAllUsersQuery } from '../features/apiSlice3'

const Data = () => {
  const { data:users, isLoading, isError, error } = useGetAllUsersQuery()
  console.log('users', users)

  if (isLoading) return <h1>Loading...</h1>
  if (isError) console.log(error)

  const { ids, entities} = users
  console.log('ids', ids)
  console.log('entities', entities)
  return ( 
    <>
      <h3>Data</h3>
        <ol>
          { ids.map(id => <li key={id}>{ id }</li>)}
        </ol>
        <hr />
        <ol>
        { ids.map(id => <li key={id}>{ entities[id].username }</li>)}
        </ol>        
    </>   
  )
}

export default Data
```

## V. Summary 


## VI. Reference
1. [RTK Query Tutorial - How to Fetch Data With Redux Toolkit Query | React Beginners Tutorial](https://youtu.be/-8WEd578fFw)
2. [React Redux RTK QUERY CRASH COURSE | Build Product Search Functionality](https://youtu.be/7KkNZffq21Y)
3. [createApi](https://redux-toolkit.js.org/rtk-query/api/createApi)
5. [createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter)
6. [Edgar Allan Poe — “The Journal of Julius Rodman”](https://www.eapoe.org/works/info/pt027.htm#text02)


## EOF (2023/01/31)

