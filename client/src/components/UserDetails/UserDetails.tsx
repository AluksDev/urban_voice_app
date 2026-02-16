import { useEffect, useState } from "react";
import "./UserDetails.css";
import { apiRequest } from "../../api";
import ReportDetails from "../ReportDetails/ReportDetails";
import Toaster from "../Toaster/Toaster";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
  status: string;
}
interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

interface userDetailsProps {
  user: User | null;
  closeUserDetailsWindow: () => void;
  onUserStatusChange: (message: string) => void;
}

const UserDetails = ({
  user,
  closeUserDetailsWindow,
  onUserStatusChange,
}: userDetailsProps) => {
  const [status, setStatus] = useState<string>(user?.status || "");
  const [activeTab, setActiveTab] = useState<string>("Details");
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [showReportDetails, setShowReportDetails] = useState<boolean>(false);
  const [selectedUserReport, setSelectedUserReport] = useState<Report | null>(
    null,
  );
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);

  async function handleChangeUserStatus() {
    try {
      const data = await apiRequest(`admin/users/${user?.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      closeUserDetailsWindow();
      onUserStatusChange(data.code);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  }
  async function fetchUserReports() {
    try {
      const data = await apiRequest(`admin/users/${user?.id}/reports`, {
        method: "GET",
        credentials: "include",
      });
      setUserReports(data.reports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
    }
  }
  async function changeReportStatus(reportStatus: string) {
    const body = await apiRequest(`admin/reports/${selectedUserReport?.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status: reportStatus }),
    });
    setToasterMessage("Report status updated successfully");
    setToasterType("success");
    setShowToaster(true);
    setSelectedUserReport(null);
    setShowReportDetails(false);
    fetchUserReports();
  }
  useEffect(() => {
    fetchUserReports();
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
  return (
    <>
      {showToaster && (
        <Toaster
          message={toasterMessage}
          type={toasterType}
          isLeaving={toasterLeaving}
        />
      )}
      {showReportDetails && (
        <ReportDetails
          report={selectedUserReport}
          onStatusChange={(newStatus) => changeReportStatus(newStatus)}
          closeDetailsWindow={() => setShowReportDetails(false)}
          isAdmin={true}
        />
      )}
      <div className="user-details-container" onClick={closeUserDetailsWindow}>
        <div
          className="user-details-inner"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="user-details-close-icon-container"
            onClick={closeUserDetailsWindow}
          >
            <img src="/images/close-icon.svg" alt="close icon" />
          </div>
          <div className="user-details-photo-container">
            <img
              src={user?.photo_url || "/images/default-profile.png"}
              alt="User Photo"
            />
          </div>
          <div className="user-details-main-container">
            <div>
              <div
                className={`details-section-selector ${activeTab === "Details" ? "active" : ""}`}
                onClick={() => setActiveTab("Details")}
              >
                Details
              </div>
              <div
                className={`details-section-selector ${activeTab === "Reports" ? "active" : ""}`}
                onClick={() => setActiveTab("Reports")}
              >
                Reports
              </div>
            </div>
            <div className="user-details-info-container">
              {activeTab === "Details" && (
                <>
                  <div className="user-details-left">
                    <div>
                      <span>ID</span>
                      <p>{user?.id}</p>
                    </div>
                    <div>
                      <span>Name</span>
                      <p>{user?.name}</p>
                    </div>
                    <div>
                      <span>Surname</span>
                      <p>{user?.surname}</p>
                    </div>
                    <div>
                      <span>Email</span>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                  <div className="user-details-right">
                    <div>
                      <span>Created At</span>
                      <p>
                        {user?.created_at &&
                          new Date(user.created_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                    <div>
                      <span>Updated At</span>
                      <p>
                        {user?.updated_at &&
                          new Date(user.updated_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                    <div>
                      <span>Role</span>
                      <p>{user?.role}</p>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "Reports" && (
                <div className="user-reports-container">
                  {userReports.length > 0 ? (
                    userReports.map((report) => (
                      <div
                        key={report.id}
                        className="user-report-item"
                        onClick={() => {
                          setSelectedUserReport(report);
                          setShowReportDetails(true);
                        }}
                      >
                        <h3>{report.title}</h3>
                        <p>{report.description}</p>
                        <p>Category: {report.category}</p>
                        <p>Status: {report.status}</p>
                      </div>
                    ))
                  ) : (
                    <p>No reports available for this user.</p>
                  )}
                </div>
              )}
            </div>
            <div className="user-details-actions-container">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              {status !== user?.status && (
                <button onClick={handleChangeUserStatus}>Change Status</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
