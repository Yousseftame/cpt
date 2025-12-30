import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const deleteAdminAccount = onCall(async (request) => {
  const { auth, data } = request;

  // لازم يكون عامل Login
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Not authenticated');
  }

  const { uid } = data as { uid: string };

  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  // منع حذف نفسه (زيادة أمان)
  if (auth.uid === uid) {
    throw new HttpsError(
      'permission-denied',
      'You cannot delete your own account'
    );
  }

  // حذف من Auth
  await admin.auth().deleteUser(uid);

  // حذف من Firestore
  await admin.firestore().collection('admins').doc(uid).delete();

  return { success: true };
});
