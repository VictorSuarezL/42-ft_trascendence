import { FormEvent, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const response = await fetch('http://localhost:3000/users');
    const data = await response.json();

    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    if (!response.ok) {
      console.error('Error creating user');
      return;
    }

    setName('');
    setEmail('');

    await loadUsers();
  };

  return (
    <main>
      <h1>Transcendence</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit">Create user</button>
      </form>

      <h2>Users</h2>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
