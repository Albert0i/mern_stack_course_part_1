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
