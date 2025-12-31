import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export const deleteCustomerAccount = onCall(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const { uid } = request.data;
    if (!uid) {
      throw new HttpsError('invalid-argument', 'Customer UID is required');
    }
 // delete from auth 
    await admin.auth().deleteUser(uid);

    // delete from firestore
    const snapshot = await admin
      .firestore()
      .collection('customers')
      .where('uid', '==', uid)
      .get();

    const batch = admin.firestore().batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return { success: true };
  }
);
