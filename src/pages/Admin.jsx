import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/logo";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError("Nepodařilo se načíst produkty");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  return (
    <div className="bg-[#25A73D] min-h-screen w-full flex flex-col">
      {/* Navigační lišta */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Logo className="h-12" />
            </Link>

            {/* Navigace */}
            <div className="flex items-center gap-6">
              <Link to="/" className="!text-gray-800 hover:text-[#25A73D] transition-colors">
                Domů
              </Link>
              <Link to="/offers" className="!text-gray-800 hover:text-[#25A73D] transition-colors">
                Nabídky
              </Link>
              <Link
                to="/admin"
                className="!text-gray-800 hover:text-[#25A73D] transition-colors font-semibold"
              >
                Admin
              </Link>

              {auth.currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="!text-gray-800 hover:text-[#25A73D] transition-colors"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => auth.signOut().then(() => navigate("/"))}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Odhlásit
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#25A73D] !text-white px-4 py-2 rounded-lg hover:bg-[#1e8c32] transition-colors"
                >
                  Přihlásit
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hlavní obsah */}
      <div className="w-full mt-25 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Admin panel</h2>
            <p className="text-gray-600">Spravuj všechny nabídky v systému</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-center">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-700">Načítám produkty...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {product.picture ? (
                    <img
                      src={product.picture}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Bez obrázku</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Smazat
                      </button>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      Přidáno:{" "}
                      {product.createdAt?.toDate
                        ? product.createdAt.toDate().toLocaleDateString()
                        : "Neznámé datum"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Žádné nabídky k zobrazení
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
