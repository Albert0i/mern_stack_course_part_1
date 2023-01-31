# "The ABC of RTK Query"

<div style="text-align: right">
<code>Method is the thing, after all.</code><br />
<span style="font-size: small">Peter Pendulum, The Business Man<br />
Edgar Allan Poe</span>
</div>


## Prologue
During the re-studying of [React Redux](https://youtu.be/NqzdVN2tyvQ), I found it extremely abstruse and unfathomable to understand [RTK Query](https://redux-toolkit.js.org/rtk-query/overview). The documentation is cryptic and indigestible for those fresh [React](https://reactjs.org/) developers like me. I crawl and crawl in [**油管**](https://www.youtube.com/), in an effort to find hints and clues and hoping to grasp it in solid, not like those *Castle In The Sand*. 

[MERN](https://youtu.be/CvCiNeLnZ00) is continuing to be an eternally obfuscating topic: 

1. How frontend cooperates with backend  dispersingly over the internet? 
2. How frontend manages state consistent with backend database? ([optimistic updates](https://stackoverflow.com/questions/33009657/what-is-optimistic-updates-in-front-end-development))
3. The ever-changing performance and security issues materially presented by [SPA/PWA](https://bsscommerce.com/blog/the-better-option-pwa-vs-spa/#About_PWA), is the last straw that broke the camel's back. 


## I. Introduction 
In a word, **Redux toolkit is a state management solution for react**. RTK Query provides built-in powerful data fetching capability which can replace [axios](https://www.npmjs.com/package/axios), [swr](https://www.npmjs.com/package/swr) or some other data fetching libraries. 

To begin with: 
```bash
npx create-react-app fronttest 
cd fronttest 
npm install @reduxjs/toolkit react-redux
```

## II. The basics
In the world view of Redux, **a slice is really a collection of reducer logic of actions for a single feature in the app**. 

For example, a blog might have a slice for post and another slice for comment to handle the logic of each differently. So they each get their own slice.

Last but not least, habitually... 
1. Slices are placed in `features` folders; 
2. [UI](https://en.wikipedia.org/wiki/User_interface) related things are placed in `components` folder; 
3. Application specific stuffs are placed in `app` folder. 

First of all, create `apiSlice.js` and import `createApi` and `fetchBaseQuery` into it. 

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

Secondly, we need to set a `base URL` for which API we're fetching data. 

Thirdly, if we want to have multiple queries as well as add, update and delete. Just put everything inside of `endpoints`. An endpoints is where we're actually going to define all the queries/mutations. The above `getAllUsers` is sometimes referred to as `builder function`, 

```javascript
export const { useGetAllUsersQuery } = usersApi
```

Finally, there's a very cool thing that RTK query does, it creates a hook for all queries/mutations inside of your endpoints. The format of the hook is: 
```
'use' + (Name of query/mutation) + 'Query/Mutation' 
```
So, we can just use it with ease in other files wherever we want to fetch the data:  

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

Please check [API Slices: React Hooks](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#usequery) for more. 

Provide the Api to our `App` so that our `Data` component can work. 

App.js
```javascript
import './App.css';
import { ApiProvider } from '@reduxjs/toolkit/query/react'
import { usersApi } from './features/apiSlice1';
import Data from './components/Data'

function App() {
  return (
    <ApiProvider api={ usersApi }>
      <Data />
    </ApiProvider>    
  );
}

export default App;
```


## III. [Customizing queries](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries)
In some cases, you may want to manipulate the data returned from a query before you put it in the cache. In this instance, you can take advantage of `transformResponse`.

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


## IV. [Normalizing Data](https://redux.js.org/tutorials/essentials/part-6-performance-normalization)
As you can see in `Data.js`, since we've been storing our data in arrays, that means we have to loop over all the items in the array using array.find() until we find the item with the ID we're looking for. 

Realistically, this doesn't take very long, but if we had arrays with hundreds or thousands of items inside, looking through the entire array to find one item becomes wasted effort. What we need is a way to look up a single item based on its ID, directly, without having to check all the other items. This process is known as **"normalization"**.

"Normalized state" means that:

- We only have one copy of each particular piece of data in our state, so there's no duplication; 
- Data that has been normalized is kept in a lookup table, where the item IDs are the keys, and the items themselves are the values; 
- There may also be an array of all of the IDs for a particular item type. 


First of all, we need to import `createEntityAdapter` into our `apiSlice.js`. 

```javascript
import { createEntityAdapter } from "@reduxjs/toolkit";
```

Secondly, Create the adapter, with `SelectId` (optional) and `sortComparer`, and `initialState`.

```javascript 
const usersAdapter = createEntityAdapter({
    // Assume IDs are stored in a field other than `user.id`
    selectId: (user) => user._id, 
    // Keep the "all IDs" array sorted based on username    
    sortComparer: (a, b) => a.username.localeCompare(b.username),
  })

const initialState = usersAdapter.getInitialState() 
```
The adapter object has a `getInitialState` function that generates an empty `{ids: [], entities: {}}` object. You can pass in more fields to getInitialState, and those will be merged in.

Fill data into adapter:  
```javascript 
. . . 
      transformResponse: (response, meta, arg) => {
          console.log('transform', response)
          return usersAdapter.setAll(initialState, response)
      },
. . . 
```

The return data is an object. 

components/Data.js
```javascript
import React from 'react'
import { useGetAllUsersQuery } from '../features/apiSlice'

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
There is much more we can do with RTK Query, if you are not Redux fans and alreay use some other fetching libraries in your project. It's probably not worth investing on RTK Query. 

But if you already have redux package installed, RTK Query is in your tool chest, it doesn't hurt to give a try...


## VI. Reference
1. [RTK Query Tutorial - How to Fetch Data With Redux Toolkit Query | React Beginners Tutorial](https://youtu.be/-8WEd578fFw)
2. [React Redux RTK QUERY CRASH COURSE | Build Product Search Functionality](https://youtu.be/7KkNZffq21Y)
3. [Redux Toolkit | createApi](https://redux-toolkit.js.org/rtk-query/api/createApi)
5. [Redux Toolkit | createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter)
6. [Redux Toolkit Setup Tutorial](https://dev.to/raaynaldo/redux-toolkit-setup-tutorial-5fjf)
7. [RTK Query Tutorial (CRUD)](https://dev.to/raaynaldo/rtk-query-tutorial-crud-51hl)
8. [Peter Pendulum, The Business Man](https://poemuseum.org/peter-pendulum/)


## Epilogue
If there is any thing on earth I hate, it is a genius. Your geniuses are all arrant asses — the greater the genius the greater the ass — and to this rule there is no exception whatever. 


## EOF (2023/02/03)

