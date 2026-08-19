import { useNavigate } from 'react-router-dom';

export function SignUpConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <p>We have sent a confirmation email to your inbox.</p>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </>
  );
}
