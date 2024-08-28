import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={isRegistering ? handleRegister : handleLogin}>
        {isRegistering ? "Register" : "Login"}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
      </button>
    </div>
  );
};

export default Auth;
