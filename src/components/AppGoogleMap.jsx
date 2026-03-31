import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

export default function AppGoogleMap({
  mapContainerStyle,
  center,
  zoom = 12,
  onClick,
  children,
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "refood-google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[280px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-700 text-sm px-4 text-center">
        Nepodařilo se načíst mapu. Zkontrolujte API klíč a připojení.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="w-full h-full min-h-[280px] bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
    >
      {children}
    </GoogleMap>
  );
}