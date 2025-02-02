import { useState } from 'react';
import axios from 'axios';

function AuthRequest() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const fetchToken = async () => {
    try {
      const response = await axios.get('http://localhost:8080/auth');
      setToken(response.data.token);
      setError(null);
    } catch (err) {
      setError('Failed to fetch token');
      setToken(null);
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Interswitch Auth Token</h1>
      <button
        onClick={fetchToken}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Get Token
      </button>
      {token && <p className="mt-4 text-green-600 break-all">Token: {token}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}

export default AuthRequest;