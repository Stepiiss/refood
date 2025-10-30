import { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/logo";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

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
    <div className="bg-[#25A73D] w-screen">
    <div className="min-h-screen flex items-center justify-center w-full bg-[#25A73D] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center flex flex-col gap-2 mb-8">
          <Logo className="h-16 mb-5" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Přidat produkt</h2>
          <p className="text-gray-500">Vyplňte údaje o novém produktu</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Název produktu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Popis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
              rows="4"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obrázek produktu
            </label>
            <div className="flex justify-center items-center">
              <label className="bg-black cursor-pointer border-2 border-black rounded-lg px-4 py-2 hover:border-[#25A73D] transition-colors">
                <span className="text-white">Vybrat soubor</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
              </label>
            </div>
  
            {image && (
              <p className="text-center mt-2 text-sm text-black">
                  Vybraný soubor: {image.name}
              </p>
            )}
        </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center bg-black cursor-pointer border-2 border-black rounded-lg px-4 py-2 hover:border-[#25A73D] transition-colors"
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