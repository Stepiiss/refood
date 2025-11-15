import { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Logo from "../components/logo";
import Navbar from "../components/navbar";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 50.0755, lng: 14.4378 }; // Praha

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  const handleMapClick = (e) => {
    setLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError("Pro přidání produktu se musíte přihlásit");
      navigate("/login");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let picture = "";
      if (image) {
        const imageRef = ref(storage, `products/${auth.currentUser.uid}_${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        picture = await getDownloadURL(snapshot.ref);
      }

      const docRef = await addDoc(collection(db, "products"), {
        name,
        description,
        picture,
        location: location || null,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email // Optional: add user email for reference
      });

      console.log("Produkt přidán:", docRef.id);
      navigate("/offers");
    } catch (err) {
      console.error("Chyba:", err);
      setError(err.code === 'permission-denied' 
        ? "Nemáte oprávnění přidat produkt" 
        : "Chyba při přidávání produktu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#25A73D] min-h-screen w-screen overflow-x-hidden">
      <Navbar />
      
      <div className="w-full mt-20 px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <Logo className="h-16 mb-5 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Přidat produkt</h2>
            <p className="text-gray-500">Vyplňte údaje o novém produktu</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název produktu
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-[#25A73D] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-[#25A73D] focus:outline-none"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek produktu
              </label>
              <label className="w-full bg-black cursor-pointer border-2 border-black rounded-lg px-4 py-3 hover:border-[#25A73D] transition-colors block text-center">
                <span className="text-white">Vybrat soubor</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {image && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  Vybraný soubor: {image.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte lokaci na mapě (klikněte na mapu)
              </label>
              <div className="rounded-lg overflow-hidden">
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
              </div>
              {location && (
                <p className="text-sm text-gray-600 mt-2">
                  Vybraná lokace: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Přidávám..." : "Přidat produkt"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/offers" className="text-sm text-gray-400 hover:underline">
              Zpět na nabídky
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}