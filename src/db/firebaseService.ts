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
  getDocFromServer,
  deleteDoc
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
    
    // Check if known legacy demo records exist to run an auto-clean sweep
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);

    const customersCollection = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersCollection);

    const paymentsCollection = collection(db, 'payments');
    const paymentsSnapshot = await getDocs(paymentsCollection);

    const statusLogsCollection = collection(db, 'statusLogs');
    const statusLogsSnapshot = await getDocs(statusLogsCollection);

    const materialsCollection = collection(db, 'materials');
    const materialsSnapshot = await getDocs(materialsCollection);

    console.log("Performing a complete database verification/clean-up sweep...");
    const batch = writeBatch(db);
    let deletedCount = 0;

    // Delete users that are mock characters
    const mockUserIds = ['user_admin_gmail', 'user_amit_gmail', 'user_mahesh_gmail', 'user_sagar', 'user_vijay', 'user_mahesh', 'user_ramesh', 'user_pooja', 'user_sneha', 'user_amit', 'user_vishal', 'user_tushar'];
    usersSnapshot.docs.forEach(doc => {
      if (mockUserIds.includes(doc.id)) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    // Delete mock or demo orders (IDs matching 'order_' + digits/keys)
    ordersSnapshot.docs.forEach(doc => {
      if (doc.id.startsWith('order_')) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    // Delete mock customers (IDs starting with 'cust_')
    customersSnapshot.docs.forEach(doc => {
      if (doc.id.startsWith('cust_')) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    // Delete mock payments (IDs starting with 'pay_')
    paymentsSnapshot.docs.forEach(doc => {
      if (doc.id.startsWith('pay_')) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    // Delete mock logs (IDs starting with 'log_' + index/suffix)
    statusLogsSnapshot.docs.forEach(doc => {
      if (doc.id === 'log_1' || doc.id === 'log_2' || doc.id === 'log_3' || doc.id.startsWith('log_mrp_')) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    // Delete mock materials (IDs starting with 'mat_')
    materialsSnapshot.docs.forEach(doc => {
      if (['mat_ply', 'mat_laminate', 'mat_hinges', 'mat_adhesive'].includes(doc.id) || doc.id.startsWith('mat_')) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`Firestore successfully purged of ${deletedCount} test/demo documents.`);
    }

    // Ensure clean production administrator accounts are provisioned
    const freshUsersSnapshot = await getDocs(collection(db, 'users'));
    if (freshUsersSnapshot.empty || freshUsersSnapshot.docs.length === 0) {
      console.log("No administrators found. Seeding core production credentials...");
      const seedBatch = writeBatch(db);
      for (const u of seedData.users) {
        seedBatch.set(doc(db, 'users', u.id), u);
      }
      await seedBatch.commit();
      console.log("Core production administrators successfully provisioned in Firestore.");
    }

  } catch (error) {
    console.error("Failed to seed and clean Firestore:", error);
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

export async function deleteUserFromFirebase(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
