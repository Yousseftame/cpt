// // src/hooks/useTickets.ts
// import { useEffect, useState } from 'react';
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   orderBy
// } from 'firebase/firestore';
// import type { Ticket } from '../types/types';
// import { db } from '../service/firebase';

// interface Props {
//   role: 'superAdmin' | 'admin';
//   adminId: string;
// }

// export const useTickets = ({ role, adminId }: Props) => {
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTickets = async () => {
//       setLoading(true);

//       let q;

//       if (role === 'superAdmin') {
//         q = query(
//           collection(db, 'tickets'),
//           orderBy('createdAt', 'desc')
//         );
//       } else {
//         q = query(
//           collection(db, 'tickets'),
//           where('assignedAdminId', '==', adminId),
//           orderBy('createdAt', 'desc')
//         );
//       }

//       const snap = await getDocs(q);

//       const data = snap.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as Ticket[];

//       setTickets(data);
//       setLoading(false);
//     };

//     fetchTickets();
//   }, [role, adminId]);

//   return { tickets, loading };
// };
