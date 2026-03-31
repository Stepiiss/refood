import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Synchronizuje aktuálního uživatele z Firebase Auth do Firestore
 * Vytvoří nebo aktualizuje uživatelský dokument v kolekci "users"
 * @param {import('firebase/auth').User} user - Firebase Auth user objekt
 * @returns {Promise<void>}
 */
export async function syncAuthUserToFirestore(user) {
  if (!user) {
    console.log("Uživatel není přihlášen, přeskakuji synchronizaci");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastSyncedAt: serverTimestamp(),
      // Zachová existující pole (role apod.) pokud dokument už existuje
    }, { merge: true });

    console.log(`Uživatel ${user.uid} synchronizován do Firestore`);
  } catch (err) {
    console.error("Chyba při synchronizaci uživatele do Firestore:", err);
    throw err;
  }
}
