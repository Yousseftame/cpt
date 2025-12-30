import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize admin SDK only once
if (getApps().length === 0) {
  initializeApp();
}

export const deleteAdminAccount = onCall(async (request) => {
  const { auth, data } = request;

  // Must be authenticated
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Not authenticated');
  }

  const { uid } = data as { uid: string };

  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  // Prevent self-deletion
  if (auth.uid === uid) {
    throw new HttpsError(
      'permission-denied',
      'You cannot delete your own account'
    );
  }

  try {
    const db = getFirestore();
    const adminAuth = getAuth();

    // Verify the caller is a superAdmin
    const callerDoc = await db.collection('admins').doc(auth.uid).get();
    
    if (!callerDoc.exists || callerDoc.data()?.role !== 'superAdmin') {
      throw new HttpsError(
        'permission-denied',
        'Only super admins can delete admin accounts'
      );
    }

    // Delete from Firestore first
    await db.collection('admins').doc(uid).delete();

    // Delete from Authentication
    await adminAuth.deleteUser(uid);

    return { 
      success: true, 
      message: 'Admin account deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    
    if (error.code === 'auth/user-not-found') {
      return { 
        success: true, 
        message: 'Admin deleted from Firestore (was not found in Authentication)' 
      };
    }
    
    throw new HttpsError(
      'internal',
      error.message || 'Failed to delete admin account'
    );
  }
});