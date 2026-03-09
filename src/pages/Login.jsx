import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";
import Logo from "../components/logo";
import BlackButton from "../components/BlackButton";

function getGoogleLoginErrorMessage(errorCode) {
  if (errorCode === "auth/unauthorized-domain") {
    return `Doména ${window.location.hostname} není povolená ve Firebase Authentication (Authorized domains).`;
  }

  if (errorCode === "auth/operation-not-allowed") {
    return "Google přihlášení není ve Firebase zapnuté. Zapněte provider Google v Authentication > Sign-in method.";
  }

  if (errorCode === "auth/popup-closed-by-user") {
    return "Přihlášení bylo zrušeno zavřením okna Google.";
  }

  if (errorCode === "auth/network-request-failed") {
    return "Síťová chyba. Zkontrolujte připojení a zkuste to znovu.";
  }

  return "Chyba při přihlášení přes Google.";
}

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
    } catch {
      setError("Chyba při přihlášení. Zkontrolujte prosím své údaje.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      if (err?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return;
      }

      setError(getGoogleLoginErrorMessage(err?.code));
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
                  placeholder="Váš e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
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
                  className="w-full p-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <BlackButton
                type="submit"
                className="w-full flex justify-center text-lg font-medium shadow-sm !bg-[#25A73D] hover:!bg-[#1e8c32]"
              >
                Přihlásit se
              </BlackButton>
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
              <BlackButton
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center items-center text-base font-medium border border-gray-300 shadow-sm !bg-white !text-gray-700 hover:!bg-gray-50"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="w-5 h-5 mr-3" />
                Google
              </BlackButton>
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