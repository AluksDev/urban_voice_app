import "./Admin.css";
import { useState } from "react";

const Admin = () => {
  const [isReports, setIsReports] = useState<boolean>(true);
  const [isAnnouncements, setIsAnnouncements] = useState<boolean>(false);
  const [isUsers, setIsUsers] = useState<boolean>(false);

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

  return (
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
              <img src="images/admin-reports-icon.png" alt="" />
            </span>
            <span>Reports</span>
          </div>
          <div
            id="announcements"
            className="admin-menu-span"
            onClick={(e) => changeView(e)}
          >
            <span>
              <img src="images/admin-messages-icon.png" alt="" />
            </span>
            <span>Announcements</span>
          </div>
          <div
            id="users"
            className="admin-menu-span"
            onClick={(e) => changeView(e)}
          >
            <span>
              <img src="images/admin-users-icon.png" alt="" />
            </span>
            <span>Users</span>
          </div>
        </div>
      </div>
      <div className="admin-main-container">
        {isReports && (
          <div>
            <h4>Reports Overview</h4>
            <div className="admin-reports-stats-container"></div>
            <div></div>
          </div>
        )}
        {isAnnouncements && <div>Announcements</div>}
        {isUsers && <div>Users</div>}
      </div>
    </div>
  );
};

export default Admin;
