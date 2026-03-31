import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../components/logo";
import BlackButton from "../components/BlackButton";
import ErrorAlert from "../components/ErrorAlert";
import FormField from "../components/FormField";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validace vstupů
    if (!name || !email || !password) {
      setError("Prosím vyplňte všechna pole");
      return;
    }
  
    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků");
      return;
    }
  
    try {
      // Vytvoření uživatele
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Uložení dodatečných informací
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          role: "user",
          createdAt: serverTimestamp(),
        });
        
        console.log("Uživatel úspěšně vytvořen");
        navigate("/");
      } catch (firestoreErr) {
        console.error("Chyba při ukládání do Firestore:", firestoreErr);
        setError("Chyba při vytváření profilu. Zkuste to prosím znovu.");
      }
    } catch (authErr) {
      console.error("Chyba autentizace:", authErr);
      switch (authErr.code) {
        case 'auth/email-already-in-use':
          setError("Tento email je již zaregistrován");
          break;
        case 'auth/invalid-email':
          setError("Neplatný formát emailu");
          break;
        case 'auth/weak-password':
          setError("Heslo je příliš slabé");
          break;
        default:
          setError("Chyba při registraci: " + authErr.message);
      }
    }
  };

  return (
    <div className="page-shell">
      <div className="min-h-screen flex items-center justify-center w-full p-4">
        <div className="surface-card w-full max-w-md">
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

          <ErrorAlert message={error} className="mb-6" />

          <form onSubmit={handleRegister} className="space-y-6">
            <FormField
              id="name"
              label="Jméno"
              placeholder="Vaše jméno"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FormField
              id="email"
              type="email"
              label="Emailová adresa"
              placeholder="Váš e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormField
              id="password"
              type="password"
              label="Heslo"
              placeholder="Minimálně 6 znaků"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <div>
              <BlackButton
                type="submit"
                className="w-full flex justify-center text-lg font-medium border border-transparent shadow-sm bg-[#25A73D] hover:bg-[#1e8c32] focus:ring-2 focus:ring-offset-2 focus:ring-[#25A73D] transition-transform transform hover:scale-105"
              >
                Registrovat se
              </BlackButton>
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
