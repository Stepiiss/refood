import { useNavigate } from "react-router-dom";
import BlackButton from "./BlackButton";

export default function ProductCard({ product, onEdit, onDelete, showActions = false }) {
  const navigate = useNavigate();

  // Kontrola zda produkt expiroval
  const isExpired = product.expirationDate && new Date(product.expirationDate.toDate()).setHours(23, 59, 59, 999) < new Date();

  // Výpočet zbývajících dní
  const getDaysRemaining = () => {
    if (!product.expirationDate) return null;
    const expDate = new Date(product.expirationDate.toDate());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden ${isExpired ? "opacity-60" : ""}`}
    >
      {product.picture ? (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img
            src={product.picture}
            alt={product.name}
            className="max-w-full max-h-48 object-contain"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Bez obrázku</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {product.description}
        </p>

        {/* Datum spotřeby */}
        {product.expirationDate && (
          <div className="mb-4">
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                isExpired
                  ? "bg-red-100 text-red-800"
                  : daysRemaining === 0
                  ? "bg-orange-100 text-orange-800"
                  : daysRemaining <= 3
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isExpired
                ? "Prošlé"
                : daysRemaining === 0
                ? "Do konce dne"
                : daysRemaining === 1
                ? "Vyprší zítra"
                : daysRemaining <= 3
                ? ` ${daysRemaining} dny`
                : ` ${daysRemaining} dní`
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Spotřebovat do: {product.expirationDate.toDate().toLocaleDateString()}
            </p>
          </div>
        )}

        {showActions ? (
          <div className="flex justify-between items-center">
            <button
              onClick={() => onEdit(product.id)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upravit
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Smazat
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <BlackButton onClick={() => navigate(`/product/${product.id}`)}>
              Kontaktovat
            </BlackButton>
          </div>
        )}

        <div className="mt-2 text-sm text-gray-500">
          Přidáno:{" "}
          {product.createdAt?.toDate
            ? product.createdAt.toDate().toLocaleDateString()
            : "Neznámé datum"}
        </div>
      </div>
    </div>
  );
}
