import React, { useState } from "react";
import "./AuthModal.css";

const AuthModal = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordRep, setPasswordRep] = useState<string>("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim inputs
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPasswordRep = passwordRep.trim();

    // Validation
    if (trimmedFullName.length < 2) {
      alert("Full Name must be at least 2 characters");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      alert("Please enter a valid email address");
      return;
    }
    if (trimmedPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (trimmedPassword !== trimmedPasswordRep) {
      alert("Passwords do not match");
      return;
    }

    // Prepare data to send
    const data = {
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: trimmedPassword,
    };

    try {
      const res = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result);

      // Reset form
      setFullName("");
      setEmail("");
      setPassword("");
      setPasswordRep("");
    } catch (err) {
      console.log("Error signing up: ", err);
    }
  };

  return (
    <div className="modal-container">
      <div className="inner-modal">
        <div className="login-container">
          <h2>Log In</h2>
          <form action="">
            <input type="text" name="" id="" />
            <input type="password" name="" id="" />
            <button>Log In</button>
          </form>
          <a>Forgot your password?</a>
        </div>
        <div className="signup-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder="Repeat Password"
              value={passwordRep}
              onChange={(e) => setPasswordRep(e.target.value)}
              minLength={8}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
