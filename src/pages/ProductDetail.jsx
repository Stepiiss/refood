import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Navbar from "../components/navbar";
import Logo from "../components/logo";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        } else {
          setError("Produkt nenalezen");
        }
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError("Nepodařilo se načíst produkt");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#25A73D] min-h-screen w-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xl text-white">Načítám...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#25A73D] min-h-screen w-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-white mb-4">{error || "Produkt nenalezen"}</p>
            <Link to="/offers" className="bg-white text-[#25A73D] px-6 py-2 rounded-lg hover:bg-gray-100">
              Zpět na nabídky
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const center = product.location 
    ? { lat: product.location.latitude, lng: product.location.longitude }
    : { lat: 50.0755, lng: 14.4378 }; // Praha jako výchozí

  return (
    <div className="bg-[#25A73D] min-h-screen w-screen overflow-x-hidden">
      <Navbar />

      <div className="w-full mt-25 px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <Logo className="h-16 mb-5 mx-auto" />
            <Link to="/offers" className="text-[#25A73D] hover:underline mb-4 inline-block">
              ← Zpět na nabídky
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Obrázek */}
            <div>
              {product.picture ? (
                <img
                  src={product.picture}
                  alt={product.name}
                  className="w-full rounded-lg shadow-md object-contain bg-gray-100 max-h-96"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Bez obrázku</span>
                </div>
              )}
            </div>

            {/* Informace */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 whitespace-pre-wrap">{product.description}</p>

              <div className="text-sm text-gray-500 mb-6">
                Přidáno: {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleDateString() : "Neznámé datum"}
              </div>

              {!user ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      📧 <strong>Email prodejce:</strong> {product.userEmail || "kontakt@refood.cz"}
                    </p>
                    <p className="text-xs text-blue-600">
                      Pro zobrazení mapy s přesnou lokací se prosím přihlaste
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="w-full inline-block text-center bg-[#25A73D] text-white px-6 py-3 rounded-lg hover:bg-[#1e8c32] transition-colors"
                  >
                    Přihlásit se
                  </Link>
                </div>
              ) : (
                <a
                  href={`mailto:${product.userEmail || "kontakt@refood.cz"}?subject=Zájem o ${product.name}`}
                  className="w-full inline-block text-center bg-[#25A73D] !text-white px-6 py-3 rounded-lg hover:bg-[#1e8c32] transition-colors"
                >
                  Kontaktovat prodejce
                </a>
              )}
            </div>
          </div>

          {/* Mapa - pouze pro přihlášené */}
          {user && product.location && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📍 Kde nás najdete</h3>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={15}
                  >
                    <Marker position={center} />
                  </GoogleMap>
                </LoadScript>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Souřadnice: {product.location.latitude.toFixed(6)}, {product.location.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {user && !product.location && (
            <div className="mt-8 text-center py-6 bg-gray-100 rounded-lg">
              <p className="text-gray-600">Pro tento produkt nebyla nastavena lokace</p>
            </div>
          )}

          {!user && (
            <div className="mt-8 text-center py-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">Mapa je dostupná pouze pro přihlášené uživatele</p>
              <Link to="/login" className="text-[#25A73D] hover:underline font-semibold">
                Přihlásit se pro zobrazení mapy →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
