import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../components/logo";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      setError("Chyba při registraci. Zkontrolujte prosím údaje.");
    }
  };

  return (
    <div className="bg-[#25A73D] w-screen">
      <div className="min-h-screen flex items-center justify-center w-full p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Vytvořte účet</h2>
            <p className="text-gray-500">
              Už máte účet?{" "}
              <Link to="/login" className="font-semibold text-[#25A73D] hover:underline">
                Přihlaste se
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                Jméno
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  placeholder="Vaše jméno"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimálně 6 znaků"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25A73D] focus:border-transparent transition"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#25A73D] hover:bg-[#1e8c32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A73D] transition-transform transform hover:scale-105"
              >
                Registrovat se
              </button>
            </div>
          </form>

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
