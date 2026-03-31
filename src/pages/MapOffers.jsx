import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { InfoWindow, Marker } from "@react-google-maps/api";
import { db } from "../firebase";
import AppGoogleMap from "../components/AppGoogleMap";
import Navbar from "../components/navbar";
import MapOfferInfoCard from "../components/MapOfferInfoCard";
import { cleanupExpiredProducts } from "../utils/cleanupExpiredProducts";

// Nastavení mapy: šířka 100 %, výška celé okno minus navbar
const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 4rem)",
};

// Když nejsou žádné body, mapa začne v Praze
const defaultCenter = { lat: 50.0755, lng: 14.4378 };

// Z různých formátů lokace udělá klasické { lat, lng }
function parseLocation(location) {
  if (!location) return null;

  // Formát, který ukládáme u produktu
  if (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  ) {
    return { lat: location.latitude, lng: location.longitude };
  }

  // Jiný možný formát souřadnic
  if (typeof location._lat === "number" && typeof location._long === "number") {
    return { lat: location._lat, lng: location._long };
  }

  // Už hotový formát pro Google Maps
  if (typeof location.lat === "number" && typeof location.lng === "number") {
    return { lat: location.lat, lng: location.lng };
  }

  return null;
}

export default function MapOffers() {
  // Všechny načtené nabídky
  const [products, setProducts] = useState([]);
  // ID nabídky, na kterou se kliklo na mapě
  const [selectedProductId, setSelectedProductId] = useState(null);
  // Jestli se ještě načítají data
  const [loading, setLoading] = useState(true);
  // Chyba pro zobrazení uživateli
  const [error, setError] = useState("");

  // Při otevření stránky načteme nabídky z databáze
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      try {
        // Čištění expirovaných produktů běží na pozadí, aby neblokovalo render mapy
        cleanupExpiredProducts().catch((cleanupErr) => {
          console.error("Cleanup expirovaných produktů selhal:", cleanupErr);
        });

        // Vezmeme poslední přidané nabídky
        const productsQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(200)
        );

        const snapshot = await getDocs(productsQuery);
        const productsData = snapshot.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));

        if (!isCancelled) {
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Chyba při načítání mapy:", err);
        if (!isCancelled) {
          setError("Nepodařilo se načíst nabídky pro mapu");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Necháme jen nabídky, co mají platnou lokaci
  const productsWithLocation = useMemo(() => {
    return products
      .map((product) => {
        const parsedLocation = parseLocation(product.location);
        if (!parsedLocation) return null;

        return {
          ...product,
          mapLocation: parsedLocation,
        };
      })
      .filter(Boolean);
  }, [products]);

  // Najde nabídku, na kterou uživatel kliknul
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return productsWithLocation.find((product) => product.id === selectedProductId) || null;
  }, [productsWithLocation, selectedProductId]);

  // Spočítá střed mapy podle všech bodů
  const mapCenter = useMemo(() => {
    if (!productsWithLocation.length) return defaultCenter;

    const total = productsWithLocation.reduce(
      (acc, product) => {
        acc.lat += product.mapLocation.lat;
        acc.lng += product.mapLocation.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / productsWithLocation.length,
      lng: total.lng / productsWithLocation.length,
    };
  }, [productsWithLocation]);

  return (
    <div className="bg-[#25A73D] min-h-screen w-screen overflow-hidden">
      {/* Nahoře zůstává jen navbar */}
      <Navbar />

      <div className="pt-16 w-full">
        {/* Co ukázat při chybě, načítání nebo bez dat */}
        {error ? (
          <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center text-white text-center px-4">
            {error}
          </div>
        ) : loading ? (
          <div className="h-[calc(100vh-4rem)] w-full bg-gray-100 animate-pulse" />
        ) : !import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center text-yellow-100 text-center px-4">
            Chybí VITE_GOOGLE_MAPS_API_KEY, mapu nelze načíst.
          </div>
        ) : productsWithLocation.length === 0 ? (
          <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center text-white text-center px-4">
            Žádné nabídky nemají nastavenou lokaci.
          </div>
        ) : (
          // Tady se vykreslí mapa
          <AppGoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={10}>
            {/* Marker pro každou nabídku s lokací */}
            {productsWithLocation.map((product) => (
              <Marker
                key={product.id}
                position={product.mapLocation}
                onClick={() => setSelectedProductId(product.id)}
              />
            ))}

            {/* Po kliknutí na marker se ukáže bublina s detailem */}
            {selectedProduct && (
              <InfoWindow
                position={selectedProduct.mapLocation}
                onCloseClick={() => setSelectedProductId(null)}
              >
                <MapOfferInfoCard product={selectedProduct} />
              </InfoWindow>
            )}
          </AppGoogleMap>
        )}
      </div>
    </div>
  );
}
