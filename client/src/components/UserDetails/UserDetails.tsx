import "./UserDetails.css";

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

interface userDetailsProps {
  user: User | null;
  closeUserDetailsWindow: () => void;
}

const UserDetails = ({ user, closeUserDetailsWindow }: userDetailsProps) => {
  return (
    <div className="user-details-container" onClick={closeUserDetailsWindow}>
      <div className="user-details-inner" onClick={(e) => e.stopPropagation()}>
        <div
          className="user-details-close-icon-container"
          onClick={closeUserDetailsWindow}
        >
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>
        <div className="user-details-info-container">
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
            <div>
              <span>Photo URL</span>
              <p>{user?.photo_url}</p>
            </div>
          </div>
        </div>
        <div className="user-details-actions-container">
          <select defaultValue={user?.status}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button>Change Status</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
