import './App.css';
import { Provider } from 'react-redux'
import { store } from './app/store'
import Data from './components/Data3'

function App() {
  return (
    <Provider store={ store }>
      <Data />
    </Provider>    
  );
}

export default App;
