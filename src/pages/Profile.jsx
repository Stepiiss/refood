import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import Navbar from "../components/navbar";
import Logo from "../components/logo";
import ProductCard from "../components/ProductCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: currentUser.uid, email: currentUser.email, ...userDoc.data() });
        } else {
          setUser({ uid: currentUser.uid, email: currentUser.email });
        }

        const q = query(collection(db, "products"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserProducts(products);
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError("Nepodařilo se načíst data profilu");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      unsubscribe();
    };
  }, [navigate]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Opravdu chcete smazat tuto nabídku?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setUserProducts(userProducts.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Chyba při mazání:", err);
        alert("Nepodařilo se smazat produkt");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Chyba při odhlášení:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#25A73D] min-h-screen w-full max-w-full overflow-x-hidden">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="bg-[#25A73D] min-h-screen w-full max-w-full overflow-x-hidden">
      <Navbar />

      <div className="w-full max-w-full mt-25 px-4 pb-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10 mb-8">
            <div className="text-center mb-6">
              <Logo className="h-16 mb-5 mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Můj profil</h2>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Informace o účtu</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-800 font-medium break-words">{user?.email}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      user?.role === "admin" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user?.role === "admin" ? "Administrátor" : "Uživatel"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Statistiky</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Počet nabídek</p>
                    <p className="text-2xl font-bold text-[#25A73D]">{userProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center flex-wrap">
              <Link
                to="/add-product"
                className="bg-[#25A73D] !text-white px-6 py-3 rounded-lg hover:bg-[#1e8c32] transition-colors text-center"
              >
                Přidat novou nabídku
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="bg-blue-500 !text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                  Admin panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Odhlásit se
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Moje nabídky</h3>
            
            {userProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showActions={true}
                    onEdit={(id) => navigate(`/edit-product/${id}`)}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Zatím jste nepřidali žádné nabídky</p>
                <Link
                  to="/add-product"
                  className="inline-block bg-[#25A73D] text-white px-6 py-3 rounded-lg hover:bg-[#1e8c32] transition-colors"
                >
                  Přidat první nabídku
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}