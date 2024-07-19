import { useNotification } from "../services/hooks/hooks";

export const Notification = () => {
  const NotificationService = useNotification();

  return NotificationService;
};
