import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  orderBy
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../service/firebase';
import toast from 'react-hot-toast';

export interface PurchasedUnit {
  modelId: string;
  serial: string;
  assignedAt: string;
}

export interface Customer {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  createdAt: any;
  createdBy: string;
  purchasedUnits: PurchasedUnit[];
  ticketsCount?: number;
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'purchasedUnits' | 'status' | 'role' | 'createdBy'> & { password: string }) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  updateCustomerStatus: (id: string, status: 'active' | 'inactive' | 'pending') => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  assignUnit: (customerId: string, unit: PurchasedUnit) => Promise<void>;
  removeUnit: (customerId: string, unit: PurchasedUnit) => Promise<void>;
  updateUnit: (customerId: string, oldUnit: PurchasedUnit, newUnit: PurchasedUnit) => Promise<void>;
  getCustomerTicketsCount: (customerId: string) => Promise<number>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
       const q = query(
        collection(db, "customers"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const customersData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const ticketsCount = await getCustomerTicketsCount(docSnap.id);
          return {
            id: docSnap.id,
            ...data,
            ticketsCount,
          } as Customer;
        })
      );
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerById = useCallback(async (id: string): Promise<Customer | null> => {
    try {
      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const ticketsCount = await getCustomerTicketsCount(id);
        return {
          id: docSnap.id,
          ...docSnap.data(),
          ticketsCount,
        } as Customer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to fetch customer details');
      return null;
    }
  }, []);

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'purchasedUnits' | 'status' | 'role' | 'createdBy'> & { password: string }) => {
    setLoading(true);
    try {
      // Store the current admin's UID BEFORE creating the customer account
      const adminUid = auth.currentUser?.uid;
      
      if (!adminUid) {
        throw new Error('You must be logged in as an admin to create customers');
      }

      // Create customer auth account
      const userCred = await createUserWithEmailAndPassword(
        auth,
        customerData.email,
        customerData.password
      );

      // Save customer to Firestore using auth UID as document ID (matching admins pattern)
      await setDoc(doc(db, 'customers', userCred.user.uid), {
        uid: userCred.user.uid,           // Customer's auth UID
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        role: 'customer',
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: adminUid,               // Admin's UID who created this customer
        purchasedUnits: [],
      });

      toast.success('Customer created successfully!');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Customer updated successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const updateCustomerStatus = useCallback(async (id: string, status: 'active' | 'inactive' | 'pending') => {
    setLoading(true);
    try {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Customer status updated to ${status}!`);
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'customers', id));
      toast.success('Customer deleted successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const assignUnit = useCallback(async (customerId: string, unit: PurchasedUnit) => {
    try {
      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: arrayUnion(unit),
      });
      toast.success('Unit assigned successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error assigning unit:', error);
      toast.error('Failed to assign unit');
      throw error;
    }
  }, [fetchCustomers]);

  const removeUnit = useCallback(async (customerId: string, unit: PurchasedUnit) => {
    try {
      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: arrayRemove(unit),
      });
      toast.success('Unit removed successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error removing unit:', error);
      toast.error('Failed to remove unit');
      throw error;
    }
  }, [fetchCustomers]);

  const updateUnit = useCallback(async (customerId: string, oldUnit: PurchasedUnit, newUnit: PurchasedUnit) => {
    try {
      const customer = await getCustomerById(customerId);
      if (!customer) throw new Error('Customer not found');

      const updatedUnits = customer.purchasedUnits.map(unit =>
        JSON.stringify(unit) === JSON.stringify(oldUnit) ? newUnit : unit
      );

      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: updatedUnits,
      });
      
      toast.success('Unit updated successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update unit');
      throw error;
    }
  }, [getCustomerById, fetchCustomers]);


  // fetch ticket id to the customer 
  const getCustomerTicketsCount = useCallback(async (customerId: string): Promise<number> => {
    try {
      const q = query(collection(db, 'tickets'), where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching tickets count:', error);
      return 0;
    }
  }, []);

  const value = {
    customers,
    loading,
    fetchCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    updateCustomerStatus,
    deleteCustomer,
    assignUnit,
    removeUnit,
    updateUnit,
    getCustomerTicketsCount,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};