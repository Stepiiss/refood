import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
      setError("Chyba registrace: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Registrace</h2>

        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Heslo (min. 6 znaků)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
          minLength={6}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
        >
          Registrovat
        </button>

        <p className="text-center text-gray-600">
          Již máte účet?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Přihlásit se
          </Link>
        </p>

        <p className="text-center text-gray-600 mt-2">
          <Link to="/" className="text-blue-500 hover:underline">
            Zpět na hlavní stránku
          </Link>
        </p>
      </form>
    </div>
  );
}