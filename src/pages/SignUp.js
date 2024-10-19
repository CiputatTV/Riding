import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ride-mr5z5pc1d-ciputdroids-projects.vercel.app/api'; // Ganti dengan URL backend Anda

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password
      });

      console.log('Server response:', response.data);
      if (response.data.success) {
        setIsSuccess(true);
        setMessage('Sign up successful! Redirecting to login page...');
        console.log('Sign up successful');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setIsSuccess(false);
        setMessage(response.data.message || 'Sign up failed. Please try again.');
        console.log('Sign up failed');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Sign up error:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {message && (
        <p style={{ color: isSuccess ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <Link to="/">Back to Login</Link>
    </div>
  );
}

export default SignUp;
