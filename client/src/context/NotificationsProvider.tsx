import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../api";

type Notification = {
  id: number;
  type: string;
  reference_id: number;
  message: string;
  createdAt: Date;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => void;
};

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  async function markAsRead(id: number) {
    try {
      const response = await apiRequest(`user/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      console.log(response.message);
      refreshNotifications();
    } catch (error) {
      console.error(error);
    }
  }
  async function refreshNotifications() {
    if (!user) return;
    try {
      const data = await apiRequest(`user/notifications`, {
        method: "GET",
        credentials: "include",
      });
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.length);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  return context;
};
