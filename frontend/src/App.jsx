import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
