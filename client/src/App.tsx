import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage/Homepage";
import MyReports from "./pages/MyReports/MyReports";
import Map from "./pages/Map/Map";
import UserProfile from "./pages/UserProfile/UserProfile";
import AuthModal from "./components/AuthModal/AuthModal";
import Toaster from "./components/Toaster/Toaster";
import { useAuth } from "./context/AuthContext";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoutes";
import NewReport from "./components/NewReport/NewReport";
import { useTranslation } from "react-i18next";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminProtectedRoute from "./components/ProtectedRoutes/AdminProtectedRoutes";
const Admin = React.lazy(() => import("./pages/Admin/Admin"));
import NotFound from "./pages/NotFound/NotFound";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

function App() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [showNewReport, setShowNewReport] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  function openReportDetails(id: number) {
    navigate(`/reports/${id}`);
  }

  useEffect(() => {
    const match = document.cookie.match(/(^|;)\s*lang=([^;]+)/);
    const lang = match ? decodeURIComponent(match[2]) : "en";
    i18n.changeLanguage(lang);
  }, []);

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
  useEffect(() => {
    if (user?.role === "admin" && window.location.pathname === "/") {
      navigate("/admin");
    }
  }, [user, navigate]);
  return (
    <>
      {showModal ? (
        <AuthModal
          onLogInSuccessful={(user, message: string) => {
            setShowModal(false);
            setShowToaster(true);
            setToasterType("success");
            setToasterMessage(message);
            if (user.role === "admin") {
              navigate("/admin"); // redirect admin immediately
            }
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
            setRefresh((prev) => prev + 1);
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
      <Routes>
        {/* Public route */}
        <Route
          element={
            <UserLayout
              openNewReport={() => setShowNewReport(true)}
              onOpenModal={() => setShowModal(true)}
              openReportDetails={openReportDetails}
            />
          }
        >
          {/* Public route */}
          <Route path="/" element={<Homepage refresh={refresh} />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoutes
                onAuthRequired={() => {
                  setToasterType("error");
                  setToasterMessage(
                    "You must be logged in to access this page",
                  );
                  setShowToaster(true);
                }}
              />
            }
          >
            <Route
              path="/reports/:id?"
              element={
                <MyReports
                  onReportDelete={(message) => {
                    setToasterType("success");
                    setToasterMessage(message);
                    setShowToaster(true);
                  }}
                  refresh={refresh}
                />
              }
            />
            <Route path="/map" element={<Map />} />
            <Route
              path="/user"
              element={
                <UserProfile
                  onPasswordChange={(message, type) => {
                    setToasterType(type);
                    setToasterMessage(message);
                    setShowToaster(true);
                  }}
                  onUserChange={(message, type) => {
                    setToasterType(type);
                    setToasterMessage(message);
                    setShowToaster(true);
                  }}
                  onLogOut={() => {
                    setToasterType("success");
                    setToasterMessage("Logged out successfully");
                    setShowToaster(true);
                  }}
                />
              }
            />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Admin />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
