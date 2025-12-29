// src/service/loginTracker.ts

import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { auditLogger } from './auditLogger';

/**
 * Track admin login
 * Call this after successful authentication
 * @param adminUid - The UID of the admin who logged in
 */

export const trackLoginDirect = async (adminUid: string) => {
  try {
    const docRef = doc(db, 'admins', adminUid);
    
    const loginRecord = {
  timestamp: new Date(), // ✅ مسموح
  userAgent: navigator.userAgent,
};

await updateDoc(docRef, {
  lastLogin: serverTimestamp(), // ✅ عادي
  loginHistory: arrayUnion(loginRecord),
});

    // Get admin info for audit log
    const adminDoc = await getDoc(docRef);
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      
      await auditLogger.log({
        action: 'ADMIN_LOGIN',
        entityType: 'admin',
        entityId: adminUid,
        entityName: adminData.name || 'Unknown',
        after: { loginTime: new Date().toISOString() },
      });
    }
  } catch (error) {
    console.error('Error tracking login:', error);
    // Don't throw - login tracking failure shouldn't block login
  }
};