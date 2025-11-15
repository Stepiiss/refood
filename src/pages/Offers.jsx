import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { Link } from "react-router-dom";
import Logo from "../components/logo";
import Navbar from "../components/navbar";
import ProductCard from "../components/ProductCard";

export default function Offers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Omezení na 50 produktů pro rychlejší načítání
        const q = query(
          collection(db, "products"), 
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError("Nepodařilo se načíst produkty");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#25A73D] min-h-screen w-screen flex flex-col">
      <Navbar />

      <div className="w-full mt-25 px-4"> 
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Nabídka jídla</h2>
            {auth.currentUser && (
              <Link to="/add-product" className="inline-block bg-[#25A73D] !text-white px-6 py-2 rounded-lg hover:bg-[#1e8c32] transition-colors mt-4">
                Přidat novou nabídku
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">Zatím zde nejsou žádné produkty</div>
          )}
        </div>
      </div>
    </div>
  );
}
