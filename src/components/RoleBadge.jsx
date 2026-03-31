export default function RoleBadge({ role }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm ${
        isAdmin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {isAdmin ? "Administrátor" : "Uživatel"}
    </span>
  );
}