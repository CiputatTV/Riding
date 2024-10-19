import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending request to:', 'http://localhost:5000/api/forgot-password');
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
      console.log('Response:', response.data);
      setIsSuccess(true);
      setMessage(`Link reset password telah dikirim ke ${email}. Silakan cek inbox email Anda atau folder spam untuk mereset password Anda.`);
    } catch (error) {
      console.error('Error details:', error);
      setIsSuccess(false);
      if (error.response?.status === 404) {
        setMessage('Email belum terdaftar. Silakan periksa kembali atau daftar jika Anda belum memiliki akun.');
      } else {
        setMessage('Terjadi kesalahan. Silakan coba lagi nanti.');
      }
    }
  };

  return (
    <div>
      <h2>Lupa Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email Anda"
          required
        />
        <button type="submit">Kirim Link Reset</button>
      </form>
      {message && <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>}
      <Link to="/">Kembali ke Login</Link>
    </div>
  );
}

export default ForgotPassword;
