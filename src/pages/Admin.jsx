import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  getDoc,
  limit,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";
import Navbar from "../components/navbar";
import ProductCard from "../components/ProductCard";
import { cleanupExpiredProducts } from "../utils/cleanupExpiredProducts";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();

  // Kontrola admin oprávnění
  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          alert("Nemáte oprávnění pro přístup k admin panelu");
          navigate("/");
        }
      } catch (err) {
        console.error("Chyba při ověřování:", err);
        navigate("/");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        if (activeTab === "products") {
          // Vymaž prošlé produkty před načtením
          await cleanupExpiredProducts();

          const q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc"),
            limit(100)
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(data);
        } else {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Načtení uživatelé:", usersData);
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError(`Nepodařilo se načíst data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError("");
    fetchData();
  }, [isAdmin, activeTab]);

  const handleDelete = async (id) => {
    if (window.confirm("Opravdu chceš tuto nabídku smazat?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Chyba při mazání:", err);
        alert("Nepodařilo se smazat produkt");
      }
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    if (
      window.confirm(
        `Opravdu chcete ${
          currentRole === "admin" ? "odebrat" : "přidat"
        } admin práva?`
      )
    ) {
      try {
        await updateDoc(doc(db, "users", userId), {
          role: currentRole === "admin" ? "user" : "admin",
        });
        setUsers(
          users.map((u) =>
            u.id === userId
              ? { ...u, role: currentRole === "admin" ? "user" : "admin" }
              : u
          )
        );
      } catch (err) {
        console.error("Chyba při změně role:", err);
        alert("Nepodařilo se změnit roli uživatele");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Opravdu chcete smazat tohoto uživatele?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        console.error("Chyba při mazání:", err);
        alert("Nepodařilo se smazat uživatele");
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="bg-[#25A73D] min-h-screen w-full flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <p className="text-xl text-gray-700">Ověřování oprávnění...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-[#25A73D] min-h-screen flex flex-col">
      <Navbar />

      <div className="w-full mt-25 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Admin panel</h2>
          </div>

          {/* Záložky */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "products"
                  ? "text-[#25A73D] border-b-2 border-[#25A73D]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Produkty
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "users"
                  ? "text-[#25A73D] border-b-2 border-[#25A73D]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Uživatelé
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-center">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-gray-300 rounded flex-1"></div>
                      <div className="h-10 bg-gray-300 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "products" ? (
            products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showActions={true}
                    onEdit={(id) => navigate(`/edit-product/${id}`)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Žádné nabídky k zobrazení
              </div>
            )
          ) : (
            users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Vytvořeno
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              user.role === "admin"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {user.createdAt?.toDate
                            ? user.createdAt.toDate().toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleAdmin(user.id, user.role)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                user.role === "admin"
                                  ? "bg-orange-500 text-white hover:bg-orange-600"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                            >
                              {user.role === "admin"
                                ? "Odebrat admin"
                                : "Přidat admin"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Smazat
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Žádní uživatelé k zobrazení
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
