import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import AuthModal from "./components/AuthModal/AuthModal";
import Toaster from "./components/Toaster/Toaster";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);

  useEffect(() => {
    if (showToaster) {
      setToasterLeaving(false); // ensure visible initially

      const leaveTimer = setTimeout(() => {
        setToasterLeaving(true); // start leaving animation
      }, 3000);

      const removeTimer = setTimeout(() => {
        setShowToaster(false); // hide completely
        setToasterLeaving(false); // reset for next toast
      }, 3300);

      return () => {
        clearTimeout(leaveTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showToaster]);
  return (
    <>
      <AuthProvider>
        {showModal ? (
          <AuthModal
            onLogInSuccessful={() => {
              setShowModal(false);
              setShowToaster(true);
            }}
          />
        ) : null}
        {showToaster && (
          <Toaster
            message={"Log In successful"}
            type={"success"}
            isLeaving={toasterLeaving}
          />
        )}
        <Header onOpenModal={() => setShowModal(true)} />
        <Homepage />
      </AuthProvider>
    </>
  );
}

export default App;
