'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
        const res = await axios.post('http://localhost:1000/api/login', {
            username,
            password,
          });
          
      console.log('API response:', res.data);
  
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // router.push('/dashboard');
        router.push('/chat');

      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed');
    }
  };
  

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
