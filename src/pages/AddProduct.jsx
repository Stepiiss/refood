import { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import { Marker } from "@react-google-maps/api";
import Logo from "../components/logo";
import Navbar from "../components/navbar";
import BlackButton from "../components/BlackButton";
import AppGoogleMap from "../components/AppGoogleMap";
import ErrorAlert from "../components/ErrorAlert";
import FormField from "../components/FormField";

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
  const [expirationDate, setExpirationDate] = useState("");
  const [category, setCategory] = useState("ready");
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

    // Validace data spotřeby
    if (!expirationDate) {
      setError("Datum spotřeby je povinné");
      return;
    }

    const selectedDate = new Date(expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Nelze přidat produkt s prošlým datem spotřeby");
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
        expirationDate: new Date(expirationDate),
        category: category,
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

  // Získání dnešního data ve formátu YYYY-MM-DD pro min atribut
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="page-shell">
      <Navbar />
      
      <div className="page-content mt-25">
        <div className="surface-card max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Logo className="h-16 mb-5 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Přidat produkt</h2>
          </div>

          <ErrorAlert message={error} className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              id="name"
              label="Název produktu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FormField
              id="description"
              as="textarea"
              label="Popis"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <FormField
              id="category"
              as="select"
              label="Kategorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "ready", label: "Hotové jídlo" },
                { value: "ingredients", label: "Suroviny" },
              ]}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek produktu
              </label>
              <label className="w-full bg-black cursor-pointer border-2 border-black rounded-lg px-4 py-3 block text-center">
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
                <AppGoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={location ? { lat: location.latitude, lng: location.longitude } : defaultCenter}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {location && (
                    <Marker position={{ lat: location.latitude, lng: location.longitude }} />
                  )}
                </AppGoogleMap>
              </div>
              {location && (
                <p className="text-sm text-gray-600 mt-2">
                  Vybraná lokace: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <FormField
                id="expirationDate"
                type="date"
                label="Datum spotřeby *"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={getTodayDate()}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Vyberte datum, do kterého je potravina spotřebitelná
              </p>
            </div>

            <BlackButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Přidávám..." : "Přidat produkt"}
            </BlackButton>
          </form>

          <div className="text-center mt-6">
            <Link to="/offers" className="text-sm text-blue-600 hover:underline">
              Zpět na nabídky
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}