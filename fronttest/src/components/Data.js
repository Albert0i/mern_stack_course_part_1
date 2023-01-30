import React from 'react'
import { useGetAllUsersQuery } from '../features/apiSlice2'

const Data = () => {
  const { data:users, isLoading, isError, error } = useGetAllUsersQuery()
  console.log('users', users)

  if (isLoading) return <h1>Loading...</h1>
  if (isError) console.log(error)

  return ( 
    <>
      <h3>Data</h3>
      <ol>
        { users.map(user => <li key={user._id}> {user.username} </li>) }
      </ol>
    </>   
  )
}

export default Data