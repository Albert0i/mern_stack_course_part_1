# "Re-visiting MERN stack (Part One)"


[![alt William Wilson](img/vlcsnap-2023-01-27-09h09m44s464.png)](https://youtu.be/JSy8m5HdlnE)


## Prologue
This [MERN](https://www.mongodb.com/mern-stack) project is made up of 13 tutorials that builds upon each other much like chapters of a book. 

MERN is an acronym that use the first letter of four complementary technologies. **M** is for [MongoDB](https://www.mongodb.com/), **E** is for [ExpressJS](https://expressjs.com/), **R** is for [React](https://reactjs.org/) and **N** is for [NodeJS](https://nodejs.org/en/). So if MERN stack is full stack that leads us to ask what is full stack? and why is the MERN stack considered to be full stack? 

A full stack application means that it requires code that runs on the server and code that runs on the browser. The code that runs on the server is referred to as the **back end** and thee code that runs on the browser is referred to as the **front end**. The front end and back end are typically two completely separated code repositories. In a large enterprise full stack project, there may be a team of developers that work on the front end and another separated team of developers that work on the back end. As a full stack developer you should be able to work on both the front end and the back end if needed. 

The back end for the MERN stack is a [REST](https://restfulapi.net/) API, a REST API also known as a restful API is an interface that two computer systems used to exchange information securely over the internet. The back end will receive requests from the front end, those requests can be classified as [CRUD](https://www.codecademy.com/article/what-is-crud) operations. CRUD is another four letter acronym like MERN, the letters of CRUD stands for create, read, update and delete. These terms also indicate which types of [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) will be used in the applicaiton, for example post relates to create, get relates to read, patch and put request relates to update, and delete has an exact match. 


## I. Repertoire
```
Chapter 1: MERN Stack Project
Chapter 2: Middleware
Chapter 3: MongoDB
Chapter 4: Controllers

Chapter 5: React JS
Chapter 6: Redux & RTK Query
Chapter 7: React & Redux Forms
```


## II. Chapter 1~2: Structure of REST API server
```
|   .gitignore
|   UserStories.md
|   package-lock.json
|   package.json
|   server.js
|
+---config
|       allowedOrigins.js
|       corsOptions.js
|
+---middleware
|       errorHandler.js
|       logger.js
|
+---public
|   \---css
|           style.css
|
+---routes
|       root.js
|
\---views
        404.html
        index.html
```
Have a look of the source tree, as you may see .gitignore, basic routes, style sheet, welcome page and 404 page, logger, error handler are properly setup. 

server.js
```javascript
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

package.json
```json
{
  "name": "lesson_02",
  "version": "1.0.0",
  "description": "techNotes MERN Project",
  "main": "server.js",
  "scripts": {
    "start": "node server",
    "dev": "nodemon server"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "date-fns": "^2.29.1",
    "express": "^4.18.1",
    "uuid": "^8.3.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.19"
  }
}
```
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) is important in public API and was nicely configured, [date-fns](https://www.npmjs.com/package/date-fns) and [uuid](https://www.npmjs.com/package/uuid) are used in logger, express.json and [cookie-parser](https://www.npmjs.com/package/cookie-parser) are added but not functioning yet.


## III. Chapter 3~4: Models and Controllers
Differences between Web API and MVC.
| Model View Controller | Web API |
| ----------- | ----------- |
| MVC is used for developing Web applications that reply to both data and views | Web API is used for generating HTTP services that reply only as data. |

Only JSON and XML data are present in Web API unlike MVC where return views, action results, etc are present. In a word, 

**Web API = MVC - views + security enhancement**

```
|   .gitignore
|   UserStories.md
|   package-lock.json
|   package.json
|   server.js
|
+---config
|       allowedOrigins.js
|       corsOptions.js
|       dbConn.js
|
+---controllers
|       notesController.js
|       usersController.js
|
+---middleware
|       errorHandler.js
|       logger.js
|
+---models
|       Note.js
|       User.js
|
+---public
|   \---css
|           style.css
|
+---routes
|       noteRoutes.js
|       root.js
|       userRoutes.js
|
\---views
        404.html
        index.html
```


### Models 
Packages [dotenv](https://www.npmjs.com/package/dotenv), [mongoose](https://www.npmjs.com/package/mongoose), [mongoose-sequence](https://www.npmjs.com/package/mongoose-sequence) are required. 

models/User.js
```javascript
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        default: "Employee"
    }],
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('User', userSchema)
```

models/Note.js
```javascript
const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Note', noteSchema)
```

.env
```
NODE_ENV=development

DATABASE_URI=mongodb+srv://<username>:<password>@cluster0.9elkk.mongodb.net/techNotesDB?retryWrites=true&w=majority
```

config/dbConn.js
```javascript
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB
```

server.js
```javascript
require('dotenv').config()
. . . 
console.log(process.env.NODE_ENV)
connectDB()
. . . 
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
```


### Controllers 
Packages [express-async-handler](https://www.npmjs.com/package/express-async-handler) and [bcrypt](https://www.npmjs.com/package/bcrypt) are required. 

We have setup the routing in server.js, then define routes/userRoutes.js and finally create controller/usersController.js with functions corresponding to each HTTP method defined in our route, which instead calls models/Users.js to do the actual work, which completes the MVC request life cycle. 

```
HTTP request → server.js → userRoutes.js → usersController.js → User.js →  MongoDB → json data
```

routes/userRoutes
```javascript
const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router
```

controllers/usersController.js 
```javascript
const User = require('../models/User')
const Note = require('../models/Note')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data 
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
```


## IV. Chapter 5: Structure of React client
```
|   .gitignore
|   UserStories.md
|   package-lock.json
|   package.json
|
+---public
|   |   favicon.ico
|   |   index.html
|   |   manifest.json
|   |   robots.txt
|   |
|   \---img
|           background.jpg
|
\---src
    |   App.js
    |   index.css
    |   index.js
    |
    +---components
    |       DashFooter.js
    |       DashHeader.js
    |       DashLayout.js
    |       Layout.js
    |       Public.js
    |
    +---features
    |   +---auth
    |   |       Login.js
    |   |       Welcome.js
    |   |
    |   +---notes
    |   |       NotesList.js
    |   |
    |   \---users
    |           UsersList.js
    |
    \---img
            background.jpg    
```
First thing first, install [react-router-dom](https://www.npmjs.com/package/react-router-dom) to enable [client side routing](https://reactrouter.com/en/main/start/overview). 

> Client side routing allows your app to update the URL from a link click without making another request for another document from the server. Instead, your app can immediately render some new UI and make data requests with fetch to update the page with new information.

Routes are setup up in both `index.js` and 'App.js'

index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```
Which practically redirects all traffics to our &lt;App /&gt; component. 

App.js
```javascript
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Public from './components/Public'
import Login from './features/auth/Login';
import DashLayout from './components/DashLayout'
import Welcome from './features/auth/Welcome'
import NotesList from './features/notes/NotesList'
import UsersList from './features/users/UsersList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />

        <Route path="dash" element={<DashLayout />}>

          <Route index element={<Welcome />} />

          <Route path="notes">
            <Route index element={<NotesList />} />
          </Route>

          <Route path="users">
            <Route index element={<UsersList />} />
          </Route>

        </Route>{/* End Dash */}

      </Route>
    </Routes>
  );
}

export default App;
```
Which setup routes to various components, ie: 

```
localhost:3000/         => <Public />
localhost:3000/login    => <Login />
localhost:3000/dash     => <Welcome /> 
localhost:3000/dash/users   => <NotesList />
localhost:3000/dash/notes   => <UsersList />
```
And these completes the basics of client side routing. 

components/Public.js
```jsx
import { Link } from 'react-router-dom'

const Public = () => {
    const content = (
        <section className="public">
            <header>
                <h1>Welcome to <span className="nowrap">Dan D. Repairs!</span></h1>
            </header>
            <main className="public__main">
                <p>Located in Beautiful Downtown Foo City, Dan D. Repairs  provides a trained staff ready to meet your tech repair needs.</p>
                <address className="public__addr">
                    Dan D. Repairs<br />
                    555 Foo Drive<br />
                    Foo City, CA 12345<br />
                    <a href="tel:+15555555555">(555) 555-5555</a>
                </address>
                <br />
                <p>Owner: Dan Davidson</p>
            </main>
            <footer>
                <Link to="/login">Employee Login</Link>
            </footer>
        </section>

    )
    return content
}
export default Public
```
![alt Public](/img/Public.JPG)

features/auth/Welcome.js
```jsx 
import { Link } from 'react-router-dom'

const Welcome = () => {

    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(date)

    const content = (
        <section className="welcome">

            <p>{today}</p>

            <h1>Welcome!</h1>

            <p><Link to="/dash/notes">View techNotes</Link></p>

            <p><Link to="/dash/users">View User Settings</Link></p>

        </section>
    )

    return content
}
export default Welcome
```
![alt Welcome](/img/Welcome.JPG)

These are the basic structure and layout of our React client. 


## V. Chapter 6: Redux & RTK Query
To install [Redux Toolkit](https://redux-toolkit.js.org/) via 
```bash
npm install @reduxjs/toolkit react-redux
```
> **Redux is a pattern and library for managing and updating application state, using events called "actions".** It serves as a centralized store for state that needs to be used across your entire application, with rules ensuring that the state can only be updated in a predictable fashion.

> RTK Query is an optional addon included in the Redux Toolkit package, and its functionality is built on top of the other APIs in Redux Toolkit.

app/api/apiSlice.js
```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3500' }),
    tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})
```
Which defines our base URL pointing to our development server, tagTypes will be used to cache data, so we can invalidate them as needed. Notice that no endpoints has yet defined. We are going to provide extended slice and attached the endpoints for notes and users. And that will be the actual endpoints. 

app/store.js
```javascript
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
})
```
To create a store, reducer and middleware are provided. 

index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { store } from './app/store'
import { Provider } from 'react-redux'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```
Wrap everything within `<Provider store={store}>`, which effectively provides our store to the application. 

features/users/usersApiSlice.js
```javascript
import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            keepUnusedDataFor: 5,
            transformResponse: responseData => {
                const loadedUsers = responseData.map(user => {
                    user.id = user._id
                    return user
                });
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'User', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'User', id }))
                    ]
                } else return [{ type: 'User', id: 'LIST' }]
            }
        }),
    }),
})

export const {
    useGetUsersQuery,
} = usersApiSlice

// returns the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

// creates memoized selector
const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
    // Pass in a selector that returns the users slice of state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)
```

![alt UserList](/img/UsersList.JPG)

![alt Public](/img/NotesList.JPG)

## VI. Chapter 7: React & Redux Forms


## VII. Intermission  
Working on both backend and frontend at the same time can be a challenging task. 


## VIII. Reference
1. [MERN Stack Full Tutorial & Project | Complete All-in-One Course | 8 Hours](https://youtu.be/CvCiNeLnZ00)
2. [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
3. [React Redux Full Course for Beginners | Redux Toolkit Complete Tutorial](https://youtu.be/NqzdVN2tyvQ)
4. [RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview)
5. [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
6. [createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter)
12. [William Wilson. A Tale.](https://poemuseum.org/william-wilson/)


## Epilogue 
<span style="font-size: 36px; font-weight: bold;">A</span>fter wandering for hours, my head was tumultuously flooding with remembrance. Wild and furious shriek resound violently inside my brain. Faint and dizzy as i was, weary and shabby as i was, I stumbled back to my lodging, being hungry and thirst, laying consciously on the couch and asked "what have I done?", "what shall I do?"... Have you ever hunger for something? I meant those metaphysical desire that you have ever dreamed on or even intended to pursuit, no matter whatsoever ends up... Exactly at that moment, I realize what I can do...  


## EOF (2023/01/27)
