import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../../service/firebase';
import toast from 'react-hot-toast';

export interface TicketMessage {
  message: string;
  senderId: string;
  senderType: 'customer' | 'admin';
  senderName?: string;
  createdAt: any;
  attachments: string[];
}

export interface InternalNote {
  note: string;
  createdBy: string;
  createdByName?: string;
  createdAt: any;
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt: any;
  assignedAt?: any;
  closedAt?: any;
  reopenedAt?: any;
  messages: TicketMessage[];
  internalNotes: InternalNote[];
}

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket | null>;
  updateTicketStatus: (id: string, status: Ticket['status']) => Promise<void>;
  updateTicketPriority: (id: string, priority: Ticket['priority']) => Promise<void>;
  assignTicket: (id: string, adminId: string, adminName: string) => Promise<void>;
  addMessage: (ticketId: string, message: Omit<TicketMessage, 'createdAt'>) => Promise<void>;
  addInternalNote: (ticketId: string, note: Omit<InternalNote, 'createdAt'>) => Promise<void>;
  removeInternalNote: (ticketId: string, noteIndex: number) => Promise<void>;
  reopenTicket: (id: string) => Promise<void>;
  closeTicket: (id: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomerInfo = async (customerId: string) => {
    try {
      const q = query(collection(db, 'customers'), where('uid', '==', customerId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const customerData = snapshot.docs[0].data();
        return {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        };
      }
    } catch (error) {
      console.error('Error fetching customer info:', error);
    }
    return null;
  };

  const fetchAdminInfo = async (adminId: string) => {
    try {
      const docRef = doc(db, 'admins', adminId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().name || 'Unknown Admin';
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
    return 'Unknown Admin';
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const ticketsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // Fetch customer info
          const customerInfo = await fetchCustomerInfo(data.customerId);

          // Fetch admin info if assigned
          let adminName = undefined;
          if (data.assignedAdminId) {
            adminName = await fetchAdminInfo(data.assignedAdminId);
          }

          return {
            id: docSnap.id,
            ...data,
            customerName: customerInfo?.name,
            customerEmail: customerInfo?.email,
            customerPhone: customerInfo?.phone,
            assignedAdminName: adminName,
          } as Ticket;
        })
      );

      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTicketById = useCallback(
    async (id: string): Promise<Ticket | null> => {
      try {
        const docRef = doc(db, 'tickets', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Fetch customer info
          const customerInfo = await fetchCustomerInfo(data.customerId);

          // Fetch admin info if assigned
          let adminName = undefined;
          if (data.assignedAdminId) {
            adminName = await fetchAdminInfo(data.assignedAdminId);
          }

          return {
            id: docSnap.id,
            ...data,
            customerName: customerInfo?.name,
            customerEmail: customerInfo?.email,
            customerPhone: customerInfo?.phone,
            assignedAdminName: adminName,
          } as Ticket;
        }
        return null;
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to fetch ticket details');
        return null;
      }
    },
    []
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: Ticket['status']) => {
      try {
        const docRef = doc(db, 'tickets', id);
        const updateData: any = {
          status,
          updatedAt: serverTimestamp(),
        };

        if (status === 'closed') {
          updateData.closedAt = serverTimestamp();
        } else if (status === 'reopened') {
          updateData.reopenedAt = serverTimestamp();
        }

        await updateDoc(docRef, updateData);
        toast.success('Ticket status updated successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error updating ticket status:', error);
        toast.error('Failed to update ticket status');
        throw error;
      }
    },
    [fetchTickets]
  );

  const updateTicketPriority = useCallback(
    async (id: string, priority: Ticket['priority']) => {
      try {
        const docRef = doc(db, 'tickets', id);
        await updateDoc(docRef, {
          priority,
          updatedAt: serverTimestamp(),
        });
        toast.success('Ticket priority updated successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error updating ticket priority:', error);
        toast.error('Failed to update ticket priority');
        throw error;
      }
    },
    [fetchTickets]
  );

  const assignTicket = useCallback(
    async (id: string, adminId: string, adminName: string) => {
      try {
        const docRef = doc(db, 'tickets', id);
        await updateDoc(docRef, {
          assignedAdminId: adminId,
          assignedAdminName: adminName,
          assignedAt: serverTimestamp(),
          status: 'in_progress', // Auto-update status when assigning
          updatedAt: serverTimestamp(),
        });
        toast.success('Ticket assigned successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error assigning ticket:', error);
        toast.error('Failed to assign ticket');
        throw error;
      }
    },
    [fetchTickets]
  );

  const addMessage = useCallback(
    async (ticketId: string, message: Omit<TicketMessage, 'createdAt'>) => {
      try {
        const docRef = doc(db, 'tickets', ticketId);
        await updateDoc(docRef, {
          messages: arrayUnion({
            ...message,
            createdAt: serverTimestamp(),
          }),
          updatedAt: serverTimestamp(),
        });
        toast.success('Message sent successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error adding message:', error);
        toast.error('Failed to send message');
        throw error;
      }
    },
    [fetchTickets]
  );

  const addInternalNote = useCallback(
    async (ticketId: string, note: Omit<InternalNote, 'createdAt'>) => {
      try {
        const docRef = doc(db, 'tickets', ticketId);
        
        // Get current ticket data
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error('Ticket not found');
        }
        
        const currentData = docSnap.data();
        const currentNotes = currentData.internalNotes || [];
        
        // Create new note with timestamp
        const newNoteWithTimestamp = {
          ...note,
          createdAt: Timestamp.now(),
        };
        
        // Update with new array
        await updateDoc(docRef, {
          internalNotes: [...currentNotes, newNoteWithTimestamp],
          updatedAt: serverTimestamp(),
        });
        
        toast.success('Internal note added successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error adding internal note:', error);
        toast.error('Failed to add internal note');
        throw error;
      }
    },
    [fetchTickets]
  );

  const removeInternalNote = useCallback(
    async (ticketId: string, noteIndex: number) => {
      try {
        const ticket = await getTicketById(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const updatedNotes = ticket.internalNotes.filter((_, index) => index !== noteIndex);

        const docRef = doc(db, 'tickets', ticketId);
        await updateDoc(docRef, {
          internalNotes: updatedNotes,
          updatedAt: serverTimestamp(),
        });

        toast.success('Internal note removed successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error removing internal note:', error);
        toast.error('Failed to remove internal note');
        throw error;
      }
    },
    [fetchTickets, getTicketById]
  );

  const reopenTicket = useCallback(
    async (id: string) => {
      try {
        const docRef = doc(db, 'tickets', id);
        await updateDoc(docRef, {
          status: 'reopened',
          reopenedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Ticket reopened successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error reopening ticket:', error);
        toast.error('Failed to reopen ticket');
        throw error;
      }
    },
    [fetchTickets]
  );

  const closeTicket = useCallback(
    async (id: string) => {
      try {
        const docRef = doc(db, 'tickets', id);
        await updateDoc(docRef, {
          status: 'closed',
          closedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Ticket closed successfully!');
        await fetchTickets();
      } catch (error) {
        console.error('Error closing ticket:', error);
        toast.error('Failed to close ticket');
        throw error;
      }
    },
    [fetchTickets]
  );

  const value = {
    tickets,
    loading,
    fetchTickets,
    getTicketById,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    addMessage,
    addInternalNote,
    removeInternalNote,
    reopenTicket,
    closeTicket,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
};