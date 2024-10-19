   // src/pages/Login.js
   import React, { useState } from 'react';
   import axios from 'axios';
   import axiosRetry from 'axios-retry';
   import { Link } from 'react-router-dom';


   // Konfigurasi axios-retry
   axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

   function Login({ setIsLoggedIn }) {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [message, setMessage] = useState('');
     const [isLoading, setIsLoading] = useState(false);

     const handleLogin = async () => {
       setIsLoading(true);
       try {
         if (!email || !password) {
           setMessage('Please enter both email and password');
           return;
         }
         const API_URL = process.env.REACT_APP_API_URL || 'https://ride-sable.vercel.app/api';
         const res = await axios.post(`${API_URL}/login`, { email, password }, { timeout: 30000 }); // Meningkatkan timeout menjadi 30 detik
         setMessage(res.data.message);
         if (res.data.token) {
           localStorage.setItem('token', res.data.token);
           setIsLoggedIn(true);
         }
       } catch (err) {
         console.error('Login error:', err);
         if (err.response) {
           // The request was made and the server responded with a status code
           // that falls out of the range of 2xx
           setMessage(err.response.data.error || 'Server error');
         } else if (err.request) {
           // The request was made but no response was received
           setMessage('No response from server. Please try again.');
         } else {
           // Something happened in setting up the request that triggered an Error
           setMessage('An error occurred. Please try again.');
         }
       } finally {
         setIsLoading(false);
       }
     };

     return (
       <div>
         <h2>Login</h2>
         <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
         <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
         <button onClick={handleLogin} disabled={isLoading}>
           {isLoading ? 'Logging in...' : 'Login'}
         </button>
         <p>{message}</p>
         <Link to="/signup">Sign Up</Link>
         <br />
         <Link to="/forgot-password">Forgot Password?</Link>
         {isLoading && <p>Please wait, connecting to server...</p>}
       </div>
     );
   }

   export default Login;
