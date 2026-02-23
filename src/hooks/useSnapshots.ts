import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserSnapshots } from '@/services/snapshots.service';
import type { DashboardSnapshot } from '@/types';

export function useSnapshots() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<DashboardSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserSnapshots(user.uid)
      .then(setSnapshots)
      .finally(() => setLoading(false));
  }, [user]);

  function refresh() {
    if (!user) return;
    setLoading(true);
    getUserSnapshots(user.uid)
      .then(setSnapshots)
      .finally(() => setLoading(false));
  }

  return { snapshots, loading, refresh };
}
