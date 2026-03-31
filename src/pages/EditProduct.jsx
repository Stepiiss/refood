import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db, auth, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Marker } from "@react-google-maps/api";
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

export default function EditProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ready");
  const [picture, setPicture] = useState(null);
  const [currentPictureURL, setCurrentPictureURL] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
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
          setCategory(data.category || "ready");
          setCurrentPictureURL(data.picture || "");
          setLocation(data.location || null);
          
          // Načtení data spotřeby
          if (data.expirationDate) {
            const date = new Date(data.expirationDate.seconds ? data.expirationDate.seconds * 1000 : data.expirationDate);
            setExpirationDate(date.toISOString().split('T')[0]);
          }
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
        category: category,
        picture: pictureURL,
        location: location || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
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
      <div className="page-shell flex items-center justify-center">
        <div className="surface-card p-8">
          <p className="text-xl text-gray-700">Ověřování oprávnění...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="page-shell flex flex-col">
      <Navbar />

      {/* Hlavní obsah */}
      <div className="page-content mt-20 py-8">
        <div className="surface-card max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Upravit nabídku</h2>
          </div>

          <ErrorAlert message={error} className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              id="name"
              label="Název produktu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />

            <FormField
              id="description"
              as="textarea"
              label="Popis"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1"
              required
            />

            <FormField
              id="category"
              as="select"
              label="Kategorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
              options={[
                { value: "ready", label: "Hotové jídlo" },
                { value: "ingredients", label: "Suroviny" },
              ]}
              required
            />

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
                className="form-input mt-1"
              />
            </div>

            <div>
              <FormField
                id="expirationDate"
                type="date"
                label="Datum spotřeby"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={getTodayDate()}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Vyberte datum, do kterého je potravina spotřebitelná
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Vyberte lokaci na mapě (klikněte na mapu)
              </label>
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
                className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg text-center hover:bg-gray-600 transition-colors"
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
