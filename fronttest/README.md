# "The ABC of RTK Query"

<div style="text-align: right">
<code>Method is the thing, after all.</code><br />
<span style="font-size: small">Peter Pendulum, The Business Man<br />
Edgar Allan Poe</span>
</div>


## Prologue
During the re-studying of [React Redux](https://youtu.be/NqzdVN2tyvQ), I found it extremely abstruse and unfathomable to understand [RTK Query](https://redux-toolkit.js.org/rtk-query/overview). The documentation is cryptic and indigestible for those fresh [React](https://reactjs.org/) developers like me. I crawl and crawl in [**油管**](https://www.youtube.com/), in an effort to find hints and clues and hope to grasp it in solid, not like those *Castle In The Sand*. 

[MERN](https://youtu.be/CvCiNeLnZ00) is continuing to be an eternally obfuscating topic: 

1. How frontend cooperates with backend  dispersingly over the internet? 
2. How frontend manages state consistent with backend database? (optimistic vs pessimist updates)
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
From the view of Redux, **a slice is really a collection of reducer logic of actions for a single feature in the app**. 

For example, a blog might have a slice for post and another slice for comment to handle the logic of each differently. So they each get their own slice.

As a good practice:  
1. Slices are placed under `features` folders; 
2. UI components and related things are placed under `components` folder; 
3. Application specific stuffs are placed under `app` folder. 

First of all, create `apiSlice.js` and import `createApi` and `fetchBaseQuery` into it. 

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
```

We are going to create a API to fetch a list of users from the backend:

```
http://localhost:3500/users
```

Output: 
```
[
  { 
    "_id":"63d1f458fe7134585e557a86",
    "username":"Hank",
    "roles":["Employee","Manager","Admin"],
    "active":true,
    "createdAt":"2023-01-26T03:32:40.223Z",
    "updatedAt":"2023-01-26T03:32:40.223Z",
    "__v":0 
  },

  { 
    "_id":"63d1f91efe7134585e557aa6",
    "username":"Dave",
    "roles":["Employee"],
    "active":true,
    "createdAt":"2023-01-26T03:53:02.897Z",
    "updatedAt":"2023-01-26T03:53:02.897Z",
    "__v":0 
  },

  { 
    "_id":"63d75b484c660aa487a1d4e5",
    "username":"Sammy",
    "roles":["Employee","Manager","Admin"],
    "active":true,
    "createdAt":"2023-01-30T05:53:12.316Z",
    "updatedAt":"2023-01-30T05:53:12.316Z",
    "__v":0 
  },

  { 
    "_id":"63d75b524c660aa487a1d4e8",
    "username":"Deam",
    "roles":["Employee","Manager","Admin"],
    "active":true,
    "createdAt":"2023-01-30T05:53:22.694Z",
    "updatedAt":"2023-01-30T05:53:22.694Z",
    "__v":0
  }
]
```
and then export it, so that we can access it from other files. 

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

We need to set a `base URL` for which API we're fetching data, ie: 
```
http://localhost:3500/
```

Thirdly, if we want to have multiple queries as well as add, update and delete. Just put everything inside of `endpoints`. An endpoints is where we're actually going to define all the queries/mutations. Note that the above `getAllUsers` is sometimes referred to as `builder function`. 

```javascript
export const { useGetAllUsersQuery } = usersApi
```

Finally, there's a very cool thing that RTK query does, it creates a hook for all queries/mutations inside of your endpoints. The format of the hook is: 
```
'use' + (Name of query/mutation) + 'Query/Mutation' 
```
Afterwards, we can just use it with ease in other files wherever we want to fetch the data:  

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

Last but not least, don't forget to provide the Api to your `App`.

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
        }
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
In this case, we make a copy of the returned array and sort it by username in alphabetical order and return it to the `Data` component. 

![alt Data1](https://raw.githubusercontent.com/Albert0i/mern_stack_course_part_1/main/img/Data1.JPG)

Please compare the unsorted and sorted results in console output. 


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
. . . 
const usersAdapter = createEntityAdapter({
    // Assume IDs are stored in a field other than `user.id`
    selectId: (user) => user._id, 
    // Keep the "all IDs" array sorted based on username    
    sortComparer: (a, b) => a.username.localeCompare(b.username),
  })

const initialState = usersAdapter.getInitialState() 
. . . 
```
The adapter object has a `getInitialState` function that generates an empty `{ids: [], entities: {}}` object. You can pass in more fields to getInitialState, and those will be merged in.

Fill in the adapter and return the normalized data:  
```javascript 
. . . 
      transformResponse: (response, meta, arg) => {
          console.log('transform', response)
          return usersAdapter.setAll(initialState, response)
      },
. . . 
```

That's it! The return data is an object with property `ids` and `entities`. 

components/Data3.js
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
      <h3>Data3</h3>
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

![alt Data3](https://raw.githubusercontent.com/Albert0i/mern_stack_course_part_1/main/img/Data3.JPG)

Please compare the order of `ids` and `entities ` in console output. 


## V. By the store
if your have already setup your [store](https://redux.js.org/usage/configuring-your-store), you can just attach the Api to the reducer. In addition, we need to setup the `middleware`, and call `setupListeners` in the last part.

store.js
```javascript
import { configureStore } from "@reduxjs/toolkit";
import { usersApi } from '../features/apiSlice';
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
```

Provides the store to ypur app as usual. 

App.js
```javascript
import './App.css';
import { Provider } from 'react-redux'
import { store } from './app/store'
import Data from './components/Data'

function App() {
  return (
    <Provider store={ store }>
      <Data />
    </Provider>    
  );
}

export default App;
```

That archieves the same result. 


## VI. [Mutation](https://redux-toolkit.js.org/rtk-query/usage/mutations) and [Automated Re-fetching](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching)
Mutations are used to send data updates to the server and apply the changes to the local cache. Mutations can also invalidate cached data and force re-fetches.

- A query can have its cached data provide tags. Doing so determines which 'tag' is attached to the cached data returned by the query.
- A mutation can invalidate specific cached data based on the tags. Doing so determines which cached data will be either refetched or removed from the cache.

apiSlice4.js
```javascript 
. . . 
        getAllUsers: builder.query({
            query: () => "users", 
            
            // In some cases, you may want to manipulate the data returned from a query 
            // before you put it in the cache. (optional)
            transformResponse: (response, meta, arg) => {
                //console.log('transform', response)
                return usersAdapter.setAll(initialState, response)
            },

            // Used by query endpoints. Determines which 'tag' is attached to the cached data // 
            // returned by the query. (optional)               
            providesTags: ['User'],
        }),
        
        addNewUser: builder.mutation({
            query: (body) => ({
                url: '/users',
                method: 'POST',
                body
            }),
            // Used by mutation endpoints. 
            // Determines which cached data should be either re-fetched or 
            // removed from the cache. Expects the same shapes as providesTags.
            invalidatesTags: ['User'],
        })
. . . 
```

`providesTags` (optional) Used by query endpoints and expects an array of tag type strings, an array of objects of tag types with ids, or a function that returns such an array.

1. ['Post'] - equivalent to 2
2. [{ type: 'Post' }] - equivalent to 1
3. [{ type: 'Post', id: 1 }]
4. (result, error, arg) => ['Post'] - equivalent to 5
5. (result, error, arg) => [{ type: 'Post' }] - equivalent to 4
6. (result, error, arg) => [{ type: 'Post', id: 1 }]

`invalidatesTags` (optional) Used by mutation endpoints. Determines which cached data should be either re-fetched or removed from the cache and expects the same shapes as providesTags.

To continue with our app, we add form beneath users list in `Data` component. 

![alt Data4](https://raw.githubusercontent.com/Albert0i/mern_stack_course_part_1/main/img/Data4.JPG)

When we click the `Save` button, a mutation is fired up, new user record is create on backend database. The status code 201 confirms this fact. In addition, a re-fetch behaviour is triggered since we've invalidate the cache and new user will be show right away!!! 

- Unlike `useQuery`, `useMutation` returns a tuple. The first item in the tuple is the "trigger" function and the second element contains an object with `status`, `error`, and `data`.
```javascript
  const { data:users, isLoading, refetch } = useGetAllUsersQuery()

  const [ addNewUser, { isError, error} ] = useAddNewUserMutation()
```

- Unlike the `useQuery` hook, the `useMutation` hook doesn't execute automatically. To run a mutation you have to call the trigger function returned as the first tuple value from the hook.
```javascript
const onSaveUserClicked = async (e) => {
      e.preventDefault()
      try {        
        await addNewUser({ username, password, roles })
      }
      catch (err)
      {
        console.log(err)
      }
      finally {
        // force re-fetches the data
        //refetch()
      }
  }
```


## VII. [Optimistic Updates](https://async-transformresponse--rtk-query-docs.netlify.app/concepts/optimistic-updates/)
When you wish to perform an update to cache data immediately after a `mutation` is triggered, you can apply an `optimistic update`. This can be a useful pattern for when you want to give the user the impression that their changes are immediate, even while the mutation request is still in flight.
(to be continue...)


## VIII. Pessimistic Updates
When you wish to perform an update to cache data based on the response received from the server after a `mutation` is triggered, you can apply a `pessimistic update`. The distinction between a `pessimistic update` and an `optimistic update` is that the `pessimistic update` will instead wait for the response from the server prior to updating the cached data.
(to be continue...)


## IX. Summary 
There is much more we can do with RTK Query, if you are not Redux fans and alreay use some other fetching libraries in your project. It's probably not worth investing on RTK Query. 

But if you already have redux package installed, RTK Query is in your tool chest, it doesn't hurt to give a try...


## X. Reference
1. [RTK Query Tutorial - How to Fetch Data With Redux Toolkit Query | React Beginners Tutorial](https://youtu.be/-8WEd578fFw)
2. [React Redux RTK QUERY CRASH COURSE | Build Product Search Functionality](https://youtu.be/7KkNZffq21Y)
3. [React Redux Toolkit with Project | Redux Axios Tutorial | React Redux Tutorial For Beginners - 1](https://youtu.be/EnIRyNT2PMI)
4. [RTK Query CRUD | Mutations & Auto-Fetching | React Redux Toolkit RTK Query Tutorial - 2](https://youtu.be/3QLpHlmdW_U)
5. [Redux Toolkit Setup Tutorial](https://dev.to/raaynaldo/redux-toolkit-setup-tutorial-5fjf)
6. [RTK Query Tutorial (CRUD)](https://dev.to/raaynaldo/rtk-query-tutorial-crud-51hl)
7. [Redux Toolkit | createApi](https://redux-toolkit.js.org/rtk-query/api/createApi)
8. [Redux Toolkit | createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter)
9. [Redux Toolkit | Manual Cache Updates](https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates)
10. [Peter Pendulum, The Business Man](https://poemuseum.org/peter-pendulum/)


## Epilogue
If there is any thing on earth I hate, it is a genius. Your geniuses are all arrant asses — the greater the genius the greater the ass — and to this rule there is no exception whatever. 


## EOF (2023/02/03)
