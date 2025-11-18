import { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import AuthModal from "./components/AuthModal/AuthModal";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {showModal ? <AuthModal /> : null}
      <Header isLoggedIn={isLoggedIn} onOpenModal={() => setShowModal(true)} />
      <Homepage />
    </>
  );
}

export default App;
