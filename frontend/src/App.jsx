import { useState } from 'react'
import './App.css'
import LoginSignup from './components/loginSignup.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <LoginSignup />
    </div>
  )
}

export default App
