import "./AnnouncementDetails.css";
import { apiRequest } from "../../api";

interface Announcement {
  id: number;
  title: string;
  content: string;
  is_published: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  archived_at: string | null;
}

interface AnnouncementDetailsProps {
  announcement: Announcement | null;
  closeAnnouncementDetailsWindow: () => void;
  onAnnouncementStatusChanged: (message: string) => void;
}

const AnnouncementDetails = ({
  announcement,
  closeAnnouncementDetailsWindow,
  onAnnouncementStatusChanged,
}: AnnouncementDetailsProps) => {
  const changeAnnouncementStatus = async (action: string) => {
    try {
      const data = await apiRequest(
        `admin/announcements/${announcement?.id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      onAnnouncementStatusChanged(data.code);
      closeAnnouncementDetailsWindow();
    } catch (e) {
      console.error("Error changing announcement status:", e);
    }
  };

  return (
    <div
      className="announcement-details-container"
      onClick={closeAnnouncementDetailsWindow}
    >
      <div
        className="announcement-details-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="announcement-details-close-icon-container"
          onClick={closeAnnouncementDetailsWindow}
        >
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>
        <div className="announcement-details-info-container">
          <div className="announcement-details-left">
            <div>
              <span>ID</span>
              <p>{announcement?.id}</p>
            </div>
            <div>
              <span>Title</span>
              <p>{announcement?.title}</p>
            </div>
            <div>
              <span>Content</span>
              <p>{announcement?.content}</p>
            </div>
            <div>
              <span>Status</span>
              <p>
                {announcement?.archived_at
                  ? "Archived"
                  : announcement?.is_published === 1
                    ? "Published"
                    : "Draft"}
              </p>
            </div>
          </div>
          <div className="announcement-details-right">
            <div>
              <span>Created At</span>
              <p>
                {announcement?.created_at &&
                  new Date(announcement.created_at).toLocaleString("en-GB", {
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
                {announcement?.updated_at &&
                  new Date(announcement.updated_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>
            <div>
              <span>Created By User #</span>
              <p>{announcement?.created_by}</p>
            </div>
            {announcement?.archived_at && (
              <div>
                <span>Archived At</span>
                <p>
                  {new Date(announcement.archived_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="announcement-details-actions-container">
          <div>
            {!announcement?.archived_at && (
              <>
                {" "}
                {announcement?.is_published === 1 ? (
                  <button onClick={() => changeAnnouncementStatus("unpublish")}>
                    Unpublish
                  </button>
                ) : (
                  <button onClick={() => changeAnnouncementStatus("publish")}>
                    Publish
                  </button>
                )}
              </>
            )}
            {announcement?.archived_at ? (
              <button onClick={() => changeAnnouncementStatus("restore")}>
                Restore as draft
              </button>
            ) : (
              <button onClick={() => changeAnnouncementStatus("archive")}>
                Archive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetails;
