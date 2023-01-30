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