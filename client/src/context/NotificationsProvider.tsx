import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../api";

type Notification = {
  id: number;
  type: string;
  reference_id: number;
  message: string;
  createdAt: Date;
  is_read: number;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
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
  function markAsRead() {
    return;
  }

  async function refreshNotifications() {
    if (!user) return;
    try {
      const data = await apiRequest(`user/notifications`, {
        method: "GET",
        credentials: "include",
      });
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter(
          (notification: Notification) => notification.is_read === 0,
        ).length,
      );
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
