import "./Admin.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ReportDetails from "../../components/ReportDetails/ReportDetails";
import Toaster from "../../components/Toaster/Toaster";
import NewAnnouncement from "../../components/NewAnnouncement/NewAnnouncement";
import { apiRequest } from "../../api";
import { t } from "i18next";

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
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[] | null
  >([]);

  const auth = useAuth();

  const changeView = (event: React.MouseEvent<HTMLSpanElement>) => {
    setIsAnnouncements(false);
    setIsReports(false);
    setIsUsers(false);
    document.querySelectorAll(".admin-menu-span").forEach((el) => {
      el.classList.remove("active");
    });
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
    const body = await apiRequest("admin/reports", {
      method: "GET",
      credentials: "include",
    });
    setReports(body.reports);
    setFilteredReports(body.reports);
  };

  const fetchUsers = async () => {
    const body = await apiRequest("admin/users", {
      method: "GET",
      credentials: "include",
    });
    setUsers(body.users);
  };

  const fetchAnnouncements = async () => {
    const body = await apiRequest("admin/announcements", {
      method: "GET",
      credentials: "include",
    });
    setAnnouncements(body.announcements);
    setFilteredAnnouncements(body.announcements);
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
    const body = await apiRequest(`admin/reports/${selectedReport?.id}`, {
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
    setSelectedReport(null);
    setShowReportDetails(false);
    fetchReports();
  };

  const filterAnnouncements = (type: string) => {
    if (type == "draft") {
      setFilteredAnnouncements(
        announcements?.filter(
          (announcement) => announcement.is_published === 0
        ) || null
      );
    } else if (type == "published") {
      setFilteredAnnouncements(
        announcements?.filter(
          (announcement) => announcement.is_published === 1
        ) || null
      );
    } else {
      setFilteredAnnouncements(announcements);
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
          onSuccessfulAnnouncement={(message: string) => {
            setToasterMessage(message);
            setToasterType("success");
            setShowToaster(true);
            fetchAnnouncements();
          }}
          closeNewAnnouncementWindow={() => {
            setShowNewAnnouncement(false);
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
                <div onClick={() => filterAnnouncements("draft")}>
                  <div>Draft</div>
                  <div className="admin-announcements-filter-icon-container">
                    <img
                      src="images/admin-announcements-draft-icon.png"
                      alt=""
                    />
                  </div>
                </div>
                <div onClick={() => filterAnnouncements("published")}>
                  <div>Published</div>
                  <div className="admin-announcements-filter-icon-container">
                    <img
                      src="images/admin-announcements-published-icon.png"
                      alt=""
                    />
                  </div>
                </div>
                <div onClick={() => filterAnnouncements("all")}>
                  <div>All</div>
                  <div className="admin-announcements-filter-icon-container">
                    <img src="images/admin-all-announcements.png" alt="" />
                  </div>
                </div>
              </div>
              <div className="admin-table-container">
                {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Is Published</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAnnouncements.map((announcement) => {
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
