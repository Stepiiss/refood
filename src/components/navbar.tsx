import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Logo from "./logo";
import BlackButton from "./BlackButton";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  // Stav mobilního rozbalovacího menu (hamburger)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Informace o přihlášeném uživateli z AuthContextu
  const { currentUser } = useAuth();

  // Po změně stránky menu zavřeme, aby nezůstalo rozkliknuté
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Odhlášení uživatele a návrat na domovskou stránku
  const handleLogout = () => {
    auth.signOut().then(() => navigate("/"));
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full px-6 box-border">
        <div className="flex justify-between items-center h-16">
          {/* Logo vlevo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-12" />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="!text-gray-800 ">
              Domů
            </Link>
            <Link
              to="/offers"
              className="!text-gray-800 "
            >
              Nabídky
            </Link>
            {currentUser ? (
              <>
                <Link
                  to="/add-product"
                  className="!text-gray-800"
                >
                  Přidat nabídku
                </Link>
                <Link
                  to="/profile"
                  className="!text-gray-800"
                >
                  Profil
                </Link>
                <BlackButton
                  onClick={handleLogout}
                  className="px-4 py-2"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Odhlásit
                </BlackButton>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#25A73D] !text-white px-4 py-2 rounded-lg"
              >
                Přihlásit
              </Link>
            )}
          </div>

          {/* Hamburger tlačítko pro mobil */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg !text-white !bg-black"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobilní rozbalené menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link to="/" className="!text-gray-800">
              Domů
            </Link>
            <Link
              to="/offers"
              className="!text-gray-800 "
            >
              Nabídky
            </Link>
            {currentUser ? (
              <>
                <Link
                  to="/add-product"
                  className="!text-gray-800"
                >
                  Přidat nabídku
                </Link>
                <Link
                  to="/profile"
                  className="!text-gray-800"
                >
                  Profil
                </Link>
                <BlackButton
                  onClick={handleLogout}
                  className="px-4 py-2 text-center"
                >
                  Odhlásit
                </BlackButton>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#25A73D] !text-white px-4 py-2 rounded-lg text-center"
              >
                Přihlásit
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}