import { useState, useEffect } from 'react';
import { dataService } from '../services/data';

export function useSettings() {
  const [settings, setSettings] = useState({ updateDays: [0, 2] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dataService.subscribeSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { settings, loading };
}
