import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db, auth, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Navbar from "../components/navbar";
import BlackButton from "../components/BlackButton";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 50.0755, lng: 14.4378 }; // Praha

export default function EditProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [picture, setPicture] = useState(null);
  const [currentPictureURL, setCurrentPictureURL] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

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
          alert("Nemáte oprávnění pro přístup k této stránce");
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

  // Načtení produktu
  useEffect(() => {
    if (!isAdmin) return;

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          const data = productDoc.data();
          setName(data.name || "");
          setDescription(data.description || "");
          setCurrentPictureURL(data.picture || "");
          setLocation(data.location || null);
        } else {
          setError("Produkt nenalezen");
        }
      } catch (err) {
        console.error("Chyba při načítání produktu:", err);
        setError("Nepodařilo se načíst produkt");
      }
    };

    fetchProduct();
  }, [id, isAdmin]);

  const handleMapClick = (e) => {
    setLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let pictureURL = currentPictureURL;

      // Nahrát nový obrázek, pokud byl vybrán
      if (picture) {
        const storageRef = ref(storage, `products/${Date.now()}_${picture.name}`);
        await uploadBytes(storageRef, picture);
        pictureURL = await getDownloadURL(storageRef);
      }

      // Aktualizovat produkt
      await updateDoc(doc(db, "products", id), {
        name,
        description,
        picture: pictureURL,
        location: location || null,
        updatedAt: new Date(),
      });

      navigate("/admin");
    } catch (err) {
      console.error("Chyba při aktualizaci:", err);
      setError("Nepodařilo se aktualizovat produkt");
    } finally {
      setLoading(false);
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
    <div className="bg-[#25A73D] min-h-screen w-full flex flex-col">
      <Navbar />

      {/* Hlavní obsah */}
      <div className="w-full mt-20 px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Upravit nabídku</h2>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                Název produktu
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25A73D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                Popis
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="mt-1 w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25A73D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Aktuální obrázek
              </label>
              {currentPictureURL && (
                <img
                  src={currentPictureURL}
                  alt="Current product"
                  className="mt-2 w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="picture">
                Nový obrázek (volitelné)
              </label>
              <input
                id="picture"
                type="file"
                accept="image/*"
                onChange={(e) => setPicture(e.target.files[0])}
                className="mt-1 w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25A73D]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Vyberte lokaci na mapě (klikněte na mapu)
              </label>
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={location ? { lat: location.latitude, lng: location.longitude } : defaultCenter}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {location && (
                    <Marker position={{ lat: location.latitude, lng: location.longitude }} />
                  )}
                </GoogleMap>
              </LoadScript>
              {location && (
                <p className="text-sm text-gray-600 mt-2">
                  Vybraná lokace: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <BlackButton
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Ukládám..." : "Uložit změny"}
              </BlackButton>
              <Link
                to="/admin"
                className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-center"
              >
                Zrušit
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
