import { useState } from 'react';
import { postRequest } from '../../utils/api';
import styles from './TestPage1.module.scss';
import type { TestUser } from '../../types/types';

export const TestPage1 = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState<TestUser>({ name: '', email: '' });
  async function fetchDataBody() {
    try {
      const response = await postRequest<{ data: TestUser }>('/api/testBody', {
        name: name,
        email: email,
      });
      setResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.test1}>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="button" onClick={fetchDataBody}>
        Call backend
      </button>
      <p>
        Data from the backend: {response.name} ({response.email})
      </p>
    </div>
  );
};
