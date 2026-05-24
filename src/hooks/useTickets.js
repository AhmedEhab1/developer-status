import { useState, useEffect } from 'react';
import { dataService } from '../services/data';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = dataService.subscribeTickets((data) => {
      setTickets(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tickets, loading, error };
}
