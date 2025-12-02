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
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoutes";
import NewReport from "./components/NewReport/NewReport";

function App() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [showNewReport, setShowNewReport] = useState<boolean>(false);

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
                setToasterType("success");
                setToasterMessage(message);
              }}
              closeModal={() => setShowModal(false)}
            />
          ) : null}
          {showNewReport && (
            <NewReport
              onSuccessfulReport={(message: string) => {
                setShowNewReport(false);
                setShowToaster(true);
                setToasterType("success");
                setToasterMessage(message);
              }}
              closeModal={() => setShowNewReport(false)}
            />
          )}
          {showToaster && (
            <Toaster
              message={toasterMessage}
              type={toasterType}
              isLeaving={toasterLeaving}
            />
          )}
          <Header
            openNewReport={() => setShowNewReport(true)}
            onOpenModal={() => setShowModal(true)}
          />
          <Routes>
            <Route path="/" element={<Homepage />} />

            <Route
              path="/reports"
              element={
                <ProtectedRoutes
                  onAuthRequired={() => {
                    setToasterType("error");
                    setToasterMessage(
                      "You must be logged in to access this page"
                    );
                    setShowToaster(true);
                  }}
                >
                  <MyReports />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/map"
              element={
                <ProtectedRoutes
                  onAuthRequired={() => {
                    setToasterType("error");
                    setToasterMessage(
                      "You must be logged in to access this page"
                    );
                    setShowToaster(true);
                  }}
                >
                  <Map />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/users/:id"
              element={
                <ProtectedRoutes
                  onAuthRequired={() => {
                    setToasterType("error");
                    setToasterMessage(
                      "You must be logged in to access this page"
                    );
                    setShowToaster(true);
                  }}
                >
                  <UserProfile />
                </ProtectedRoutes>
              }
            />

            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
