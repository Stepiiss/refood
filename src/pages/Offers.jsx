import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { Link } from "react-router-dom";
import Logo from "../components/logo";
import Navbar from "../components/navbar";
import ProductCard from "../components/ProductCard";
import { cleanupExpiredProducts } from "../utils/cleanupExpiredProducts";

export default function Offers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created"); // "created" nebo "expiration"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Nejprve vymaž prošlé produkty
        await cleanupExpiredProducts();
        
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

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Filtrování podle hledaného termu
  let finalFiltered = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sortování
  finalFiltered.sort((a, b) => {
    if (sortBy === "created") {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    } else if (sortBy === "expiration") {
      const dateA = a.expirationDate?.toDate?.() || new Date(a.expirationDate);
      const dateB = b.expirationDate?.toDate?.() || new Date(b.expirationDate);
      return dateA - dateB; // Nejdřív expirující se zobrazí první
    }
    return 0;
  });

  return (
    <div className="bg-[#25A73D] min-h-screen flex flex-col">
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

          {/* Filtry - Kategorie, Hledání a Sortování */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 !border-[#25A73D] !bg-white !text-gray-800 rounded-lg font-medium focus:outline-none focus:border-[#1e8c32] cursor-pointer hover:border-[#1e8c32] transition-colors"
            >
              <option value="all">Všechny produkty</option>
              <option value="ready">Hotové jídlo</option>
              <option value="ingredients">Suroviny</option>
            </select>
            <input
              type="text"
              placeholder="Hledat produkt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border-2 !border-[#25A73D] !bg-white !text-gray-800 rounded-lg font-medium focus:outline-none focus:border-[#1e8c32] hover:border-[#1e8c32] transition-colors placeholder-gray-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 !border-[#25A73D] !bg-white !text-gray-800 rounded-lg font-medium focus:outline-none focus:border-[#1e8c32] cursor-pointer hover:border-[#1e8c32] transition-colors"
            >
              <option value="created">Nejnovější</option>
              <option value="expiration">Podle data spotřeby</option>
            </select>
          </div>

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
            <>
              {finalFiltered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {finalFiltered.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  V těchto filtrech nejsou žádné produkty
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">Zatím zde nejsou žádné produkty</div>
          )}
        </div>
      </div>
    </div>
  );
}
