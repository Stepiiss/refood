import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigace */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-2xl font-bold text-green-600">
              Refood
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/offers" className="text-gray-700 hover:text-green-600">
              Nabídky
            </Link>

            {currentUser ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-green-600">
                  Profil
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Odhlásit se
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Přihlásit se
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Registrovat
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Obsah */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Refood
          </h1>
         
          {!currentUser && (
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-600"
              >
                Začít sdílet
              </Link>
              <Link
                to="/offers"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg text-lg hover:bg-green-50"
              >
                Prohlédnout nabídky
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}