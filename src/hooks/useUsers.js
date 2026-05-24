import { useState, useEffect } from 'react';
import { dataService } from '../services/data';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = dataService.subscribeUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { users, loading, error };
}
