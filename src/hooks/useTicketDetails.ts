// src/hooks/useTicketDetails.ts
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../service/firebase';
import type { Ticket } from '../types/types';

export const useTicketDetails = (ticketId: string) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);

      const ref = doc(db, 'tickets', ticketId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setTicket({ id: snap.id, ...snap.data() } as Ticket);
      }

      setLoading(false);
    };

    fetchTicket();
  }, [ticketId]);

  return { ticket, loading };
};
