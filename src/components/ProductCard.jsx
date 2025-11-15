import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onEdit, onDelete, showActions = false }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden">
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
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Kontaktovat
            </button>
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
