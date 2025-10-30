import { Link } from "react-router-dom";
import { auth } from "../firebase";
import Logo from "./logo";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();       
    return (<nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo vlevo */}
            <Link to="/" className="flex items-center">
              <Logo className="h-12" />
            </Link>

            {/* Navigace vpravo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="!text-gray-800 hover:text-[#25A73D] transition-colors">
                Domů
              </Link>
              <Link
                to="/offers"
                className="!text-gray-800 hover:text-[#25A73D] transition-colors font-semibold"
              >
                Nabídky
              </Link>
              {auth.currentUser ? (
                <>
                  <Link
                    to="/add-product"
                    className="!text-gray-800 hover:text-[#25A73D] transition-colors"
                  >
                    Přidat nabídku
                  </Link>
                  <Link
                    to="/profile"
                    className="!text-gray-800 hover:text-[#25A73D] transition-colors"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => auth.signOut().then(() => navigate("/"))}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Odhlásit
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#25A73D] !text-white px-4 py-2 rounded-lg hover:bg-[#1e8c32] transition-colors"
                >
                  Přihlásit
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
}