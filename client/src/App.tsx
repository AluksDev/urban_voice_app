import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import MyReports from "./pages/MyReports/MyReports";
import Map from "./pages/Map/Map";
import UserProfile from "./pages/UserProfile/UserProfile";
import AuthModal from "./components/AuthModal/AuthModal";
import Toaster from "./components/Toaster/Toaster";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
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
      <BrowserRouter>
        <AuthProvider>
          {showModal ? (
            <AuthModal
              onLogInSuccessful={(message: string) => {
                setShowModal(false);
                setShowToaster(true);
                setToasterMessage(message);
              }}
            />
          ) : null}
          {showToaster && (
            <Toaster
              message={toasterMessage}
              type={"success"}
              isLeaving={toasterLeaving}
            />
          )}
          <Header onOpenModal={() => setShowModal(true)} />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/reports" element={<MyReports />} />
            <Route path="/map" element={<Map />} />
            <Route path="/users/:id" element={<UserProfile />} />
            {/* 404 route */}
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
