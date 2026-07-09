import { useState } from "react";
import { supabase } from "../services/supabase";

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password.");
      return;
    }

    setLoading(true);

    let response;

    if (mode === "signup") {
      response = await supabase.auth.signUp({
        email,
        password,
      });
    } else {
      response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    setLoading(false);

    if (response.error) {
      alert(response.error.message);
      return;
    }

    if (mode === "signup") {
      alert("Signup successful. Check your email if confirmation is required.");
    }

    onLogin(response.data.user);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          AI Resume Studio
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-center">
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        <input
          className="border w-full p-3 rounded-lg mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border w-full p-3 rounded-lg mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="bg-blue-600 text-white w-full py-3 rounded-lg"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 text-blue-600 w-full"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}