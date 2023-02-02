import React from 'react'
import { useGetAllUsersQuery, useAddNewUserMutation } from '../features/apiSlice4'
import { useState } from "react"

const Data = () => {
  const { data:users, isLoading, refetch } = useGetAllUsersQuery()

  const [ addNewUser, { isError, error} ] = useAddNewUserMutation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState(["Employee"])
  
  const onUsernameChanged = e => setUsername(e.target.value)
  const onPasswordChanged = e => setPassword(e.target.value)
  const onRolesChanged = e => {
    const values = Array.from(
        e.target.selectedOptions, //HTMLCollection 
        (option) => option.value
    )
    setRoles(values)
  }
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

  const ROLES = {
                  Employee: 'Employee',
                  Manager: 'Manager',
                  Admin: 'Admin'
                }
  const options = Object.values(ROLES).map(role => {
      return (
          <option
              key={role}
              value={role}

          > {role}</option >
      )
  })

  if (isLoading) return <h1>Loading...</h1>
  
  //console.log('users', users)
  const { ids, entities} = users
  //console.log('ids', ids)
  //console.log('entities', entities)
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
        <hr />

        <form className="form" onSubmit={onSaveUserClicked}>
          <div>
            <label htmlFor="username">Username: </label>
            <input id="username" name="username" type="text" value={username}
                onChange={onUsernameChanged}
            />
          </div>
          <div>
            <label htmlFor="password">Password: </label>
            <input id="password" name="password" type="password" value={password}
                onChange={onPasswordChanged}
            />
          </div>    
          <div>
            <label htmlFor="roles">Assigned roles:</label>
            <select
                id="roles"
                name="roles"
                multiple={true}
                size="3"
                value={roles}
                onChange={onRolesChanged}
            >
                {options}
          </select>
          </div>      
          <div>
            <button type="submit">Save</ button>
          </div>
          <div>
            { JSON.stringify(error) }
          </div>

        </form>
    </>   
  )
}

export default Data