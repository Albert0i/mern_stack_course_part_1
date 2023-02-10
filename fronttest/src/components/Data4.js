import React from 'react'
import { Button, List, Form, Message, Label, Input, Container, Header, Divider } from 'semantic-ui-react'
import { useGetAllUsersQuery, useAddNewUserMutation } from '../features/apiSlice4'
import { useState } from "react"

const Data = () => {
  const { data:users, isLoading, refetch } = useGetAllUsersQuery('', { pollingInterval: 5000} )

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
    <Container>
      <Header>Data</Header>
        <Divider />
        <List bulleted>
          { ids.map(id => <List.Item key={id}>{ id }</List.Item>)}
        </List>

        <Divider />
        <List bulleted size="big">
        { ids.map(id => <List.Item key={id}>{ entities[id].username }</List.Item>)}
        </List>        
        <Divider />

        { error ? 
          <Message color="red" size="big"> { JSON.stringify(error, undefined, 2) } </Message> : 
          ''
        }

        <Form className="form" onSubmit={onSaveUserClicked}>
          <Header>Add New</Header>
          <Form.Field>
            <Label htmlFor="username">Username: </Label>
            <Input id="username" name="username" type="text" value={username}
                onChange={onUsernameChanged}
            />
          </Form.Field>

          <Form.Field>
            <Label htmlFor="password">Password: </Label>
            <Input id="password" name="password" type="password" value={password}
                onChange={onPasswordChanged}
            />
          </Form.Field>    

          <Form.Field>
            <Label htmlFor="roles">Assigned roles:</Label>
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
          </Form.Field>    

          <Form.Field>
            <Button type="submit" primary>Save</ Button>
          </Form.Field>

        </Form>
    </Container>   
  )
}

export default Data