import { Link } from "react-router-dom";

function getCategoryLabel(category) {
  if (category === "ready") return "Hotové jídlo";
  if (category === "ingredients") return "Suroviny";
  return "Nabídka";
}

function formatExpirationDate(expirationDate) {
  if (!expirationDate) return "Bez data spotřeby";

  const parsedDate = expirationDate?.toDate
    ? expirationDate.toDate()
    : new Date(expirationDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Bez data spotřeby";
  }

  return parsedDate.toLocaleDateString("cs-CZ");
}

export default function MapOfferInfoCard({ product }) {
  if (!product) return null;

  return (
    <div className="w-[260px]">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        {product.picture ? (
          <img
            src={product.picture}
            alt={product.name}
            className="w-full h-28 object-cover"
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 flex items-center justify-center">
            <span className="text-xs !text-gray-500">Bez obrázku</span>
          </div>
        )}

        <span className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-md text-[11px] font-semibold !text-gray-800">
          {getCategoryLabel(product.category)}
        </span>
      </div>

      <p className="text-base font-bold leading-tight !text-gray-900 line-clamp-2 mb-1">
        {product.name}
      </p>

      <p className="text-sm !text-gray-600 line-clamp-2 min-h-[2.5rem]">
        {product.description || "Bez popisu"}
      </p>

      <p className="text-xs !text-gray-500 mt-2 mb-3">
        Spotřebujte do: {formatExpirationDate(product.expirationDate)}
      </p>

      <Link
        to={`/product/${product.id}`}
        className="block w-full text-center text-sm font-semibold bg-[#25A73D] !text-white py-2 rounded-md hover:bg-[#1f9235] transition-colors"
      >
        Detail nabídky
      </Link>
    </div>
  );
}