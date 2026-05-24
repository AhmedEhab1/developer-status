import { useState, useEffect } from 'react';
import { dataService } from '../services/data';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = dataService.subscribeProjects((data) => {
      setProjects(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { projects, loading, error };
}
