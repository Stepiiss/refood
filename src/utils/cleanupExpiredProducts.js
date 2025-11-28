import { db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

export const cleanupExpiredProducts = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "products"), 
      where("expirationDate", "<", today)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
      await deleteDoc(doc(db, "products", docSnapshot.id));
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Chyba při mazání prošlých produktů:", error);
  }
};
