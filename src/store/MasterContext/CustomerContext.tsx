// src/store/MasterContext/CustomerContext.tsx

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
   
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
import { auditLogger } from '../../service/auditLogger';

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
  updatedAt?: any;
  updatedBy?: string;
  purchasedUnits: PurchasedUnit[];
  ticketsCount?: number;
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'purchasedUnits' | 'status' | 'role' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { password: string }) => Promise<void>;
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

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'purchasedUnits' | 'status' | 'role' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { password: string }) => {
    setLoading(true);
    try {
      const adminUid = auth.currentUser?.uid;
      
      if (!adminUid) {
        throw new Error('You must be logged in as an admin to create customers');
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        customerData.email,
        customerData.password
      );

      const newCustomerData = {
        uid: userCred.user.uid,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        role: 'customer',
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: adminUid,
        purchasedUnits: [],
      };

      await setDoc(doc(db, 'customers', userCred.user.uid), newCustomerData);

      // 🔥 LOG AUDIT: Customer Created
      await auditLogger.log({
        action: "CREATED_CUSTOMER",
        entityType: "customer",
        entityId: userCred.user.uid,
        entityName: customerData.name,
        after: newCustomerData,
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
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      // Get before state
      const before = await getCustomerById(id);

      const docRef = doc(db, 'customers', id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
      };

      await updateDoc(docRef, updateData);

      // Get after state
      const after = await getCustomerById(id);

      // 🔥 LOG AUDIT: Customer Updated
      if (before && after) {
        await auditLogger.log({
          action: "UPDATED_CUSTOMER",
          entityType: "customer",
          entityId: id,
          entityName: after.name,
          before: before,
          after: after,
        });
      }

      toast.success('Customer updated successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, getCustomerById]);

  const updateCustomerStatus = useCallback(async (id: string, status: 'active' | 'inactive' | 'pending') => {
    setLoading(true);
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      // Get before state
      const before = await getCustomerById(id);

      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
      });

      // Get after state
      const after = await getCustomerById(id);

      // 🔥 LOG AUDIT: Status Changed
      if (before && after) {
        await auditLogger.log({
          action: "CHANGED_CUSTOMER_STATUS",
          entityType: "customer",
          entityId: id,
          entityName: after.name,
          before: { status: before.status },
          after: { status: after.status },
        });
      }

      toast.success(`Customer status updated to ${status}!`);
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, getCustomerById]);

  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // Get customer data before deletion
      const customer = await getCustomerById(id);

      await deleteDoc(doc(db, 'customers', id));

      // 🔥 LOG AUDIT: Customer Deleted
      if (customer) {
        await auditLogger.log({
          action: "DELETED_CUSTOMER",
          entityType: "customer",
          entityId: id,
          entityName: customer.name,
          before: customer,
        });
      }

      toast.success('Customer deleted successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, getCustomerById]);

  const assignUnit = useCallback(async (customerId: string, unit: PurchasedUnit) => {
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: arrayUnion(unit),
        updatedBy: adminUid,
        updatedAt: serverTimestamp(),
      });

      // Get customer info
      const customer = await getCustomerById(customerId);

      // 🔥 LOG AUDIT: Unit Assigned
      if (customer) {
        await auditLogger.log({
          action: "ASSIGNED_UNIT_TO_CUSTOMER",
          entityType: "customer",
          entityId: customerId,
          entityName: customer.name,
          after: { unit },
        });
      }

      toast.success('Unit assigned successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error assigning unit:', error);
      toast.error('Failed to assign unit');
      throw error;
    }
  }, [fetchCustomers, getCustomerById]);

  const removeUnit = useCallback(async (customerId: string, unit: PurchasedUnit) => {
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: arrayRemove(unit),
        updatedBy: adminUid,
        updatedAt: serverTimestamp(),
      });

      // Get customer info
      const customer = await getCustomerById(customerId);

      // 🔥 LOG AUDIT: Unit Removed
      if (customer) {
        await auditLogger.log({
          action: "REMOVED_UNIT_FROM_CUSTOMER",
          entityType: "customer",
          entityId: customerId,
          entityName: customer.name,
          before: { unit },
        });
      }

      toast.success('Unit removed successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error removing unit:', error);
      toast.error('Failed to remove unit');
      throw error;
    }
  }, [fetchCustomers, getCustomerById]);

  const updateUnit = useCallback(async (customerId: string, oldUnit: PurchasedUnit, newUnit: PurchasedUnit) => {
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      const customer = await getCustomerById(customerId);
      if (!customer) throw new Error('Customer not found');

      const updatedUnits = customer.purchasedUnits.map(unit =>
        JSON.stringify(unit) === JSON.stringify(oldUnit) ? newUnit : unit
      );

      const docRef = doc(db, 'customers', customerId);
      await updateDoc(docRef, {
        purchasedUnits: updatedUnits,
        updatedBy: adminUid,
        updatedAt: serverTimestamp(),
      });

      // 🔥 LOG AUDIT: Unit Updated
      await auditLogger.log({
        action: "UPDATED_CUSTOMER_UNIT",
        entityType: "customer",
        entityId: customerId,
        entityName: customer.name,
        before: { unit: oldUnit },
        after: { unit: newUnit },
      });
      
      toast.success('Unit updated successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update unit');
      throw error;
    }
  }, [getCustomerById, fetchCustomers]);

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