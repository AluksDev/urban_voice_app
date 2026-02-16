import { useEffect, useState } from "react";
import "./NewAnnouncement.css";
import { apiUrl } from "../../api";
import Toaster from "../Toaster/Toaster";
import { apiRequest } from "../../api";

interface NewAnnouncementProps {
  closeNewAnnouncementWindow: () => void;
  onSuccessfulAnnouncement: (message: string) => void;
}

const NewAnnouncement = ({
  closeNewAnnouncementWindow,
  onSuccessfulAnnouncement,
}: NewAnnouncementProps) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);

  async function handleNewAnnouncement(action: string) {
    const publish = action === "publish" ? true : false;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (trimmedTitle.length == 0 || trimmedContent.length == 0) {
      setToasterMessage("Fill all the fields");
      setToasterType("error");
      setShowToaster(true);
      return;
    }
    try {
      const data = await apiRequest("admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, content, publish }),
      });
      onSuccessfulAnnouncement("Announcement created successfully");
      closeNewAnnouncementWindow();
    } catch (e) {
      console.error("Error creating new announcement:", e);
    }
  }

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
    <div
      className="new-announcement-main-container"
      onClick={() => closeNewAnnouncementWindow()}
    >
      {showToaster && (
        <Toaster
          message={toasterMessage}
          type={toasterType}
          isLeaving={toasterLeaving}
        />
      )}
      <div
        className="new-announcement-inner-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="new-announcement-close-icon-container"
          onClick={() => closeNewAnnouncementWindow()}
        >
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>
        <h3>New Announcement</h3>
        <div>
          <div className="new-announcement-input-container">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="new-announcement-input-container">
            <span>Content</span>
            <textarea
              defaultValue={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
        </div>
        <div className="new-announcement-buttons-container">
          <button onClick={() => handleNewAnnouncement("save")}>Save</button>
          <button onClick={() => handleNewAnnouncement("publish")}>
            Save and Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAnnouncement;
