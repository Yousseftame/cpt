// src/hooks/usePermissions.ts

import { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../service/firebase';
import type { Admin, AdminPermissions } from '../store/MasterContext/AdminContext';

export const usePermissions = () => {
  const { user } = useAuth();
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.uid) {
        setCurrentAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setCurrentAdmin({
            id: adminDoc.id,
            ...adminDoc.data(),
          } as Admin);
        } else {
          setCurrentAdmin(null);
        }
      } catch (error) {
        console.error('Error fetching admin permissions:', error);
        setCurrentAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user?.uid]);

  /**
   * Check if current admin has a specific permission
   * @param module - The module name (e.g., 'customers', 'tickets')
   * @param action - The action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns boolean - true if admin has permission
   */
  const hasPermission = (module: keyof AdminPermissions, action: string): boolean => {
    if (!currentAdmin) return false;
    
    // Super admins have all permissions
    if (currentAdmin.role === 'superAdmin') return true;
    
    // Check if inactive admin
    if (currentAdmin.status === 'inactive') return false;
    
    const modulePermissions = currentAdmin.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions[action as keyof typeof modulePermissions] === true;
  };

  /**
   * Check if current admin can access a module (has at least one permission)
   * @param module - The module name
   * @returns boolean - true if admin can access the module
   */
  const canAccessModule = (module: keyof AdminPermissions): boolean => {
    if (!currentAdmin) return false;
    
    // Super admins can access everything
    if (currentAdmin.role === 'superAdmin') return true;
    
    // Check if inactive admin
    if (currentAdmin.status === 'inactive') return false;
    
    const modulePermissions = currentAdmin.permissions[module];
    if (!modulePermissions) return false;
    
    // Check if at least one permission is true
    return Object.values(modulePermissions).some(permission => permission === true);
  };

  /**
   * Check if current admin is a super admin
   * @returns boolean
   */
  const isSuperAdmin = (): boolean => {
    return currentAdmin?.role === 'superAdmin';
  };

  /**
   * Check if current admin account is active
   * @returns boolean
   */
  const isActive = (): boolean => {
    return currentAdmin?.status === 'active';
  };

  /**
   * Get all permissions for a specific module
   * @param module - The module name
   * @returns object with all permissions for that module
   */
  const getModulePermissions = (module: keyof AdminPermissions) => {
    if (!currentAdmin) return {};
    
    // Super admins have all permissions
    if (currentAdmin.role === 'superAdmin') {
      const allTrue: any = {};
      const modulePerms = currentAdmin.permissions[module];
      Object.keys(modulePerms).forEach(key => {
        allTrue[key] = true;
      });
      return allTrue;
    }
    
    return currentAdmin.permissions[module] || {};
  };

  return {
    currentAdmin,
    loading,
    hasPermission,
    canAccessModule,
    isSuperAdmin,
    isActive,
    getModulePermissions,
  };
};

// Export helper type for permission checks
export type PermissionModule = keyof AdminPermissions;