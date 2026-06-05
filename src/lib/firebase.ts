import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { 
  SimulatedUser, 
  MigracaoElos, 
  TrocaCartao, 
  CancelamentoBoleto, 
  ControlePJ, 
  AppNotification 
} from "../types";
import { 
  INITIAL_USERS, 
  INITIAL_MIGRACAO_ELOS, 
  INITIAL_TROCA_CARTAO, 
  INITIAL_CANCELAMENTO_BOLETO, 
  INITIAL_CONTROLE_PJ, 
  INITIAL_NOTIFICATIONS 
} from "../initialData";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections handles
const USERS_PATH = "users";
const MIGRACAO_PATH = "migracoes";
const TROCA_PATH = "trocas";
const CANCELAMENTO_PATH = "cancelamentos";
const CONTROLE_PJ_PATH = "controle_pj";
const NOTIFICATIONS_PATH = "notifications";

// Connection check
export async function checkConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

// Function to seed initial data if collections are empty so we preserve sample data
export async function seedInitialDataIfRequired() {
  try {
    // 1. Users
    const usersSnap = await getDocs(collection(db, USERS_PATH));
    if (usersSnap.empty) {
      console.log("Seeding simulated users to Firestore...");
      for (const item of INITIAL_USERS) {
        await setDoc(doc(db, USERS_PATH, item.id), item);
      }
    }

    // 2. Migracoes
    const migSnap = await getDocs(collection(db, MIGRACAO_PATH));
    if (migSnap.empty) {
      console.log("Seeding boletos migrations log to Firestore...");
      for (const item of INITIAL_MIGRACAO_ELOS) {
        await setDoc(doc(db, MIGRACAO_PATH, item.id), item);
      }
    }

    // 3. Trocas
    const trSnap = await getDocs(collection(db, TROCA_PATH));
    if (trSnap.empty) {
      console.log("Seeding active card swaps tracker to Firestore...");
      for (const item of INITIAL_TROCA_CARTAO) {
        await setDoc(doc(db, TROCA_PATH, item.id), item);
      }
    }

    // 4. Cancelamentos
    const cancSnap = await getDocs(collection(db, CANCELAMENTO_PATH));
    if (cancSnap.empty) {
      console.log("Seeding cancellations log to Firestore...");
      for (const item of INITIAL_CANCELAMENTO_BOLETO) {
        await setDoc(doc(db, CANCELAMENTO_PATH, item.id), item);
      }
    }

    // 5. Controle PJ
    const pjSnap = await getDocs(collection(db, CONTROLE_PJ_PATH));
    if (pjSnap.empty) {
      console.log("Seeding PJ contracts monitoring to Firestore...");
      for (const item of INITIAL_CONTROLE_PJ) {
        await setDoc(doc(db, CONTROLE_PJ_PATH, item.id), item);
      }
    }

    // 6. Notifications
    const mockNotifSnap = await getDocs(collection(db, NOTIFICATIONS_PATH));
    if (mockNotifSnap.empty) {
      console.log("Seeding notification center alerts to Firestore...");
      for (const item of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, NOTIFICATIONS_PATH, item.id), item);
      }
    }
    console.log("Firestore seeding verify completed successfully!");
  } catch (err) {
    console.error("Failed to seed collections on Firestore setup:", err);
  }
}

// Database Actions Wrapper
export const dbService = {
  // --- USERS ---
  async getUsers(): Promise<SimulatedUser[]> {
    try {
      const snap = await getDocs(collection(db, USERS_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimulatedUser));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, USERS_PATH);
    }
  },
  async saveUser(user: SimulatedUser): Promise<void> {
    try {
      await setDoc(doc(db, USERS_PATH, user.id), user);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${USERS_PATH}/${user.id}`);
    }
  },
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, USERS_PATH, userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${USERS_PATH}/${userId}`);
    }
  },

  // --- MIGRAÇÃO BOLETO -> ELOS ---
  async getMigracoes(): Promise<MigracaoElos[]> {
    try {
      const snap = await getDocs(collection(db, MIGRACAO_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MigracaoElos));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, MIGRACAO_PATH);
    }
  },
  async saveMigracao(item: MigracaoElos): Promise<void> {
    try {
      await setDoc(doc(db, MIGRACAO_PATH, item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${MIGRACAO_PATH}/${item.id}`);
    }
  },
  async deleteMigracao(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, MIGRACAO_PATH, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${MIGRACAO_PATH}/${id}`);
    }
  },

  // --- TROCA DE CARTÃO ---
  async getTrocas(): Promise<TrocaCartao[]> {
    try {
      const snap = await getDocs(collection(db, TROCA_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrocaCartao));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, TROCA_PATH);
    }
  },
  async saveTroca(item: TrocaCartao): Promise<void> {
    try {
      await setDoc(doc(db, TROCA_PATH, item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${TROCA_PATH}/${item.id}`);
    }
  },
  async deleteTroca(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TROCA_PATH, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${TROCA_PATH}/${id}`);
    }
  },

  // --- CANCELAMENTO RECORRENTE -> BOLETO ---
  async getCancelamentos(): Promise<CancelamentoBoleto[]> {
    try {
      const snap = await getDocs(collection(db, CANCELAMENTO_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CancelamentoBoleto));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, CANCELAMENTO_PATH);
    }
  },
  async saveCancelamento(item: CancelamentoBoleto): Promise<void> {
    try {
      await setDoc(doc(db, CANCELAMENTO_PATH, item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${CANCELAMENTO_PATH}/${item.id}`);
    }
  },
  async deleteCancelamento(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CANCELAMENTO_PATH, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${CANCELAMENTO_PATH}/${id}`);
    }
  },

  // --- CONTROLE PJ ---
  async getControlePJ(): Promise<ControlePJ[]> {
    try {
      const snap = await getDocs(collection(db, CONTROLE_PJ_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ControlePJ));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, CONTROLE_PJ_PATH);
    }
  },
  async saveControlePJ(item: ControlePJ): Promise<void> {
    try {
      await setDoc(doc(db, CONTROLE_PJ_PATH, item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${CONTROLE_PJ_PATH}/${item.id}`);
    }
  },
  async deleteControlePJ(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CONTROLE_PJ_PATH, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${CONTROLE_PJ_PATH}/${id}`);
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const snap = await getDocs(collection(db, NOTIFICATIONS_PATH));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, NOTIFICATIONS_PATH);
    }
  },
  async saveNotification(item: AppNotification): Promise<void> {
    try {
      await setDoc(doc(db, NOTIFICATIONS_PATH, item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${NOTIFICATIONS_PATH}/${item.id}`);
    }
  },
  async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_PATH, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${NOTIFICATIONS_PATH}/${id}`);
    }
  }
};

// Auto-run connection diagnostic
checkConnection();
