import "./Admin.css";
import { useEffect, useState } from "react";
import { apiUrl } from "../../api";
import { useAuth } from "../../context/AuthContext";
import ReportDetails from "../../components/ReportDetails/ReportDetails";
import Toaster from "../../components/Toaster/Toaster";
import NewAnnouncement from "../../components/NewAnnouncement/NewAnnouncement";

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

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  is_published: number;
  created_at: string;
  updated_at: string;
  created_by: number;
}

const Admin = () => {
  const [isReports, setIsReports] = useState<boolean>(true);
  const [isAnnouncements, setIsAnnouncements] = useState<boolean>(false);
  const [isUsers, setIsUsers] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[] | null>([]);
  const [filteredReports, setFilteredReports] = useState<Report[] | null>([]);
  const [users, setUsers] = useState<User[] | null>([]);
  const [showReportDetails, setShowReportDetails] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [showNewAnnouncement, setShowNewAnnouncement] =
    useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(
    null
  );

  const auth = useAuth();

  const changeView = (event: React.MouseEvent<HTMLSpanElement>) => {
    setIsAnnouncements(false);
    setIsReports(false);
    setIsUsers(false);
    document.querySelectorAll(".admin-menu-span").forEach((el) => {
      el.classList.remove("active");
    });
    console.log(event.currentTarget.id);
    switch (event.currentTarget.id) {
      case "reports":
        setIsReports(true);
        break;
      case "announcements":
        setIsAnnouncements(true);
        break;
      case "users":
        setIsUsers(true);
        break;
    }
    event.currentTarget.classList.add("active");
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/reports`, {
        method: "GET",
        credentials: "include",
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error("Error in response: " + body.code);
      }
      setReports(body.reports);
      setFilteredReports(body.reports);
    } catch (e) {
      console.error("Error fetching reports:", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/users`, {
        method: "GET",
        credentials: "include",
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error("Error in response: " + body.code);
      }
      setUsers(body.users);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/announcements`, {
        method: "GET",
        credentials: "include",
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error("Error in response: " + body.code);
      }
      console.log(body.announcements);
      setAnnouncements(body.announcements);
    } catch (e) {
      console.error("Error fetching announcements:", e);
    }
  };

  const filterReports = (status: string) => {
    if (status !== "all") {
      setFilteredReports(
        reports?.filter((report) => report.status === status) || null
      );
    } else {
      setFilteredReports(reports);
    }
  };

  const changeReportStatus = async (reportStatus: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/reports/${selectedReport?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: reportStatus }),
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error("Error in response: " + body.code);
      }
      setToasterMessage("Report status updated successfully");
      setToasterType("success");
      setShowToaster(true);
      setSelectedReport(null);
      setShowReportDetails(false);
      fetchReports();
    } catch (e) {
      console.error("Error changing report status:", e);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchUsers();
    fetchAnnouncements();
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
          closeDetailsWindow={() => setShowReportDetails(false)}
          report={selectedReport}
          isAdmin={true}
          onStatusChange={(newStatus) => changeReportStatus(newStatus)}
        />
      )}
      {showNewAnnouncement && (
        <NewAnnouncement
          closeNewAnnouncementWindow={(message?: string) => {
            setShowNewAnnouncement(false);
            if (message) {
              setToasterMessage(message);
              setToasterType("success");
              setShowToaster(true);
            }
          }}
        />
      )}

      <div className="admin-panel-container">
        <div className="admin-side-container">
          <div>
            <h3>Admin Dashboard</h3>
          </div>
          <div className="admin-menu-items">
            <div
              id="reports"
              className="admin-menu-span active"
              onClick={(e) => changeView(e)}
            >
              <span>
                <img src="images/admin-reports-icon.svg" alt="" />
              </span>
              <span>Reports</span>
            </div>
            <div
              id="announcements"
              className="admin-menu-span"
              onClick={(e) => changeView(e)}
            >
              <span>
                <img src="images/admin-messages-icon.svg" alt="" />
              </span>
              <span>Announcements</span>
            </div>
            <div
              id="users"
              className="admin-menu-span"
              onClick={(e) => changeView(e)}
            >
              <span>
                <img src="images/admin-users-icon.svg" alt="" />
              </span>
              <span>Users</span>
            </div>
            <div
              id="logout"
              className="admin-menu-span"
              onClick={() => auth.logout()}
            >
              <span>
                <img src="images/admin-logout-icon.svg" alt="" />
              </span>
              <span>Log Out</span>
            </div>
          </div>
        </div>
        <div className="admin-main-container">
          {isReports && (
            <div>
              <h4>Reports Overview</h4>
              <div className="admin-reports-stats-container">
                <div
                  className="admin-stat-box"
                  onClick={() => filterReports("pending")}
                >
                  <div>
                    <span>Pending</span>
                    <span className="admin-stat-box-icon-container">
                      <img src="images/stopwatch-icon.png" alt="" />
                    </span>
                  </div>
                  <div>
                    <span>
                      {
                        reports?.filter((report) => report.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="admin-stat-box"
                  onClick={() => filterReports("approved")}
                >
                  <div>
                    <span>Approved</span>
                    <span className="admin-stat-box-icon-container">
                      <img src="images/admin-approved-icon.png" alt="" />
                    </span>
                  </div>
                  <div>
                    <span>
                      {
                        reports?.filter(
                          (report) => report.status === "approved"
                        ).length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="admin-stat-box"
                  onClick={() => filterReports("rejected")}
                >
                  <div>
                    <span>Rejected</span>
                    <span className="admin-stat-box-icon-container">
                      <img
                        src="images/admin-rejected-reports-icon.png"
                        alt=""
                      />
                    </span>
                  </div>
                  <div>
                    <span>
                      {
                        reports?.filter(
                          (report) => report.status === "rejected"
                        ).length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="admin-stat-box"
                  onClick={() => filterReports("closed")}
                >
                  <div>
                    <span>Closed</span>
                    <span className="admin-stat-box-icon-container">
                      <img src="images/admin-closed-reports-icon.png" alt="" />
                    </span>
                  </div>
                  <div>
                    <span>
                      {
                        reports?.filter((report) => report.status === "closed")
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="admin-stat-box"
                  onClick={() => filterReports("all")}
                >
                  <div>
                    <span>Total</span>
                    <span className="admin-stat-box-icon-container">
                      <img src="images/admin-total-reports-icon.png" alt="" />
                    </span>
                  </div>
                  <div>
                    <span>{reports?.length}</span>
                  </div>
                </div>
              </div>
              <div className="admin-table-container">
                {filteredReports && filteredReports.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>id</th>
                        <th>User_id</th>
                        <th>Location_id</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => {
                        return (
                          <tr
                            key={report.id}
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportDetails(true);
                            }}
                          >
                            <td>{report.id}</td>
                            <td>{report.user_id}</td>
                            <td>{report.location_id}</td>
                            <td>{report.title}</td>
                            <td>{report.description}</td>
                            <td>{report.category}</td>
                            <td>{report.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>No reports found</p>
                )}
              </div>
            </div>
          )}
          {isAnnouncements && (
            <div className="admin-announcements-main-container">
              <h4>Announcements</h4>
              <div>
                <button
                  className="new-announcement-button"
                  onClick={() => setShowNewAnnouncement(true)}
                >
                  New Announcement
                </button>
              </div>
              <div className="admin-announcements-filter-container">
                <div>
                  <div>Draft</div>
                  <div className="admin-announcements-filter-icon-container">
                    <img
                      src="images/admin-announcements-draft-icon.png"
                      alt=""
                    />
                  </div>
                </div>
                <div>
                  <div>Published</div>
                  <div className="admin-announcements-filter-icon-container">
                    <img
                      src="images/admin-announcements-published-icon.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className="admin-table-container">
                {announcements && announcements.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Is Published</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((announcement) => {
                        return (
                          <tr key={announcement.id}>
                            <td>{announcement.id}</td>
                            <td>{announcement.title}</td>
                            <td>{announcement.content}</td>
                            <td>
                              {announcement.is_published === 1
                                ? "Published"
                                : "Draft"}
                            </td>
                            <td>
                              {new Date(announcement.created_at).toLocaleString(
                                "es-ES"
                              )}
                            </td>
                            <td>
                              {new Date(announcement.updated_at).toLocaleString(
                                "es-ES"
                              )}
                            </td>
                            <td>{announcement.created_by}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>No announcements found</p>
                )}
              </div>
            </div>
          )}
          {isUsers && (
            <div>
              <h4>Users</h4>
              <div className="admin-table-container">
                {users && users.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>id</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        return (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.surname}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>No users found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
