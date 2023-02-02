import './App.css';
import { ApiProvider } from '@reduxjs/toolkit/query/react'
import { usersApi } from './features/apiSlice4';
import Data from './components/Data3'

function App() {
  return (
    <ApiProvider api={ usersApi }>
      <Data />
    </ApiProvider>    
  );
}

export default App;
