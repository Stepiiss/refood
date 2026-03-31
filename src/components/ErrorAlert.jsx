export default function ErrorAlert({ message, centered = false, className = "" }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg ${
        centered ? "text-center" : ""
      } ${className}`}
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
}