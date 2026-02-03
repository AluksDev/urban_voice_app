import "./MessagesBoard.css";
import { apiRequest } from "../../api";
import { useEffect, useState } from "react";

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

const MessagesBoard = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const fetchMessages = async () => {
    try {
      const data = await apiRequest("announcements/", { method: "GET" });
      setAnnouncements(data.announcements);
    } catch (e) {
      console.error("Failed to fetch announcements:", e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <section className="messages-board-container">
      <h3>Board</h3>
      <div className="messages-scroll-container">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <article key={announcement.id}>
              <div className="message-details-container">
                <span>{announcement.title}</span>
                <span>//</span>
                <span>
                  {new Date(announcement.updated_at).toLocaleString()}
                </span>
              </div>
              <p>{announcement.content}</p>
            </article>
          ))
        ) : (
          <p>No messages</p>
        )}
      </div>
    </section>
  );
};

export default MessagesBoard;
