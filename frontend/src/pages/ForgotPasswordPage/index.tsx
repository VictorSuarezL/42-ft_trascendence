import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  async function handleSubmit() {
    try {
      const response = await fetch(
        'http://localhost:3000/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      console.log('Response:', data);

      if (!response.ok) {
        console.error('Failed:', data.error);
        return;
      }

      navigate('/email-confirmation');
    } catch (error) {
      console.error('Request failed:', error);
    }
  }
  return (
    <div>
      <h1>Forgot Password</h1>
      <p>Please enter your email address to reset your password.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
