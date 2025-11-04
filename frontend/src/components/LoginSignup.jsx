import React from 'react'
import './loginSignup.css'
import userIcon from "./assets/person.png";
import emailIcon from "./assets/email.png";
import passwordIcon from "./assets/password.png";

const LoginSignup = () => {
  return (
    <div className='container'>
        <div className='header'>
            <div className='text'>Login</div>
            <div className='underline'></div>
        </div>
        <div className='inputs'>
            <div className='input'>
                <input type="email" placeholder="user@example.com"/>
            </div>
            <div className='input'>
                <input type="password" placeholder="Password"/>
            </div>
        </div>
        <div className="forget-password"> Lost Password? <span>Click Here</span></div>
        <div className="submit-container">
            <button className="submit">Sign Up</button>
            <button className="submit">Log In</button>
        </div>
    </div>
  )
}

export default LoginSignup