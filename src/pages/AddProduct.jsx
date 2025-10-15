import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `products/${image.name + Date.now()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "products"), {
        name,
        description,
        price: Number(price),
        imageUrl,
        createdAt: new Date(),
      });

      navigate("/offers");
    } catch (err) {
      setError("Chyba při přidávání produktu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-[#25A73D] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <svg
            width="60"
            height="60"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto mb-4"
          >
            <circle cx="24" cy="24" r="24" fill="#25A73D" />
            <path
              d="M34 18L21 31L14 24"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cena (Kč)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
              required
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Obrázek produktu
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#25A73D] hover:bg-[#1e8c32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A73D] transition-transform transform hover:scale-105 disabled:opacity-50"
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
  );
}