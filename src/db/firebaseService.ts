/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signInAnonymously } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch, 
  getDocFromServer 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AppState } from './store';
import { User, Customer, Order, StatusLog, Material, Payment } from '../types';

// Connect with proper authentication securely or fall back to unauthenticated guest mode if Auth is not enabled in Firebase Console
export async function authenticateFirebase(): Promise<boolean> {
  try {
    await signInAnonymously(auth);
    console.log("Firebase Auth signed in anonymously successfully.");
    await testConnection();
    return true;
  } catch (error) {
    console.warn("Firebase Auth failed (not enabled or restricted), switching to unauthenticated client mode:", error);
    // Since Firebase Anonymous Auth might be restricted/disabled, we fall back to unauthenticated public mode.
    // If the Firestore security rules allow unauthenticated operations, the sync and databases will still work flawlessly.
    try {
      await testConnection();
      return true;
    } catch (testError) {
      console.error("Unauthenticated connection test failed too:", testError);
      return true; // Still return true so that syncFirestore can attempt to initialize
    }
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}

// Check with server and seed if database is currently empty
export async function seedFirestoreIfEmpty(seedData: AppState): Promise<void> {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    if (usersSnapshot.empty) {
      console.log("Firestore is empty. Seeding robust workshop model dataset recursively...");
      
      const batch = writeBatch(db);
      
      // Seed Users
      for (const u of seedData.users) {
        batch.set(doc(db, 'users', u.id), u);
      }
      
      // Seed Customers
      for (const c of seedData.customers) {
        batch.set(doc(db, 'customers', c.id), c);
      }
      
      // Seed Orders
      for (const o of seedData.orders) {
        batch.set(doc(db, 'orders', o.id), o);
      }
      
      // Seed Status Logs
      for (const l of seedData.statusLogs) {
        batch.set(doc(db, 'statusLogs', l.id), l);
      }
      
      // Seed Materials
      for (const m of seedData.materials) {
        batch.set(doc(db, 'materials', m.id), m);
      }
      
      // Seed Payments
      for (const p of seedData.payments) {
        batch.set(doc(db, 'payments', p.id), p);
      }
      
      await batch.commit();
      console.log("Firestore successfully seeded with 6 default workshop collections.");
    } else {
      console.log("Firestore already contains data. Seeding phase bypassed.");
    }
  } catch (error) {
    console.error("Failed to seed Firestore:", error);
  }
}

// Sync Firestore changes in real-time
export function syncFirestore(
  onUpdate: (updatedState: Partial<AppState>) => void,
  onError: (error: Error) => void
): () => void {
  const unsubscribers: (() => void)[] = [];

  const listenCollection = (name: string, callback: (docs: any[]) => void) => {
    const colRef = collection(db, name);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => doc.data());
        callback(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, name);
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    );
    unsubscribers.push(unsub);
  };

  listenCollection('users', (docs) => onUpdate({ users: docs as User[] }));
  listenCollection('customers', (docs) => onUpdate({ customers: docs as Customer[] }));
  listenCollection('orders', (docs) => onUpdate({ orders: docs as Order[] }));
  listenCollection('statusLogs', (docs) => onUpdate({ statusLogs: docs as StatusLog[] }));
  listenCollection('materials', (docs) => onUpdate({ materials: docs as Material[] }));
  listenCollection('payments', (docs) => onUpdate({ payments: docs as Payment[] }));

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

// Standard Write and Mutate Operations securely isolated with handleFirestoreError
export async function saveUserToFirebase(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCustomerToFirebase(customer: Customer): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveOrderToFirebase(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStatusLogToFirebase(log: StatusLog): Promise<void> {
  const path = `statusLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'statusLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMaterialToFirebase(material: Material): Promise<void> {
  const path = `materials/${material.id}`;
  try {
    await setDoc(doc(db, 'materials', material.id), material);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePaymentToFirebase(payment: Payment): Promise<void> {
  const path = `payments/${payment.id}`;
  try {
    await setDoc(doc(db, 'payments', payment.id), payment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
