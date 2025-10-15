import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Logo from "../components/logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Chyba při přihlášení. Zkontrolujte prosím své údaje.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError("Chyba při přihlášení přes Google.");
    }
  };

  return (
    <div className="bg-[#25A73D] w-screen">
      <div className="min-h-screen flex items-center justify-center w-full p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Přihlaste se</h2>
            <p className="text-gray-500">
              Nemáte účet?{" "}
              <Link to="/register" className="font-semibold text-[#25A73D] hover:underline">
                Vytvořit účet
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Emailová adresa
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  placeholder="vas.email@domena.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Heslo
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  placeholder="Zadejte své heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#25A73D] hover:bg-[#1e8c32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A73D] transition-transform transform hover:scale-105"
              >
                Přihlásit se
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nebo pokračujte s</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-white-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A73D] transition-transform transform hover:scale-105"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="w-5 h-5 mr-3" />
                Google
              </button>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/" className="text-sm text-gray-400 hover:underline">
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}