// import * as Notifications from "expo-notifications";
// import React, {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { registerForPushNotificationsAsync } from "../components/notification/courseNotification";

// interface NotificationContextType {
//   expoPushToken: string | null;
//   notification: Notifications.Notification | null;
//   error: Error | null;
// }

// const NotificationContext = createContext<NotificationContextType | undefined>(
//   undefined
// );

// export const useNotification = () => {
//   const context = useContext(NotificationContext);
//   if (context === undefined) {
//     throw new Error(
//       "useNotification must be used within a NotificationProvider"
//     );
//   }
//   return context;
// };

// interface NotificationProviderProps {
//   children: ReactNode;
// }

// export const NotificationProvider: React.FC<NotificationProviderProps> = ({
//   children,
// }) => {
//   const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
//   const [notification, setNotification] =
//     useState<Notifications.Notification | null>(null);
//   const [error, setError] = useState<Error | null>(null);

//   // ✅ CORRECTION : Initialiser avec undefined
//   const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
//   const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

//   useEffect(() => {
//     registerForPushNotificationsAsync().then(
//       (token) => setExpoPushToken(token),
//       (error) => setError(error)
//     );

//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         // console.log("🔔 Notification Received: ", notification);
//         setNotification(notification);
//       });

//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         console.log(
//           "🔔 Notification Response: ",
//           JSON.stringify(response, null, 2),
//           JSON.stringify(response.notification.request.content.data, null, 2)
//         );
//         // Handle the notification response here
//       });

//     return () => {
//       // ✅ CORRECTION : Vérifier et appeler remove()
//       if (notificationListener.current) {
//         notificationListener.current.remove();
//       }
//       if (responseListener.current) {
//         responseListener.current.remove();
//       }
//     };
//   }, []);

//   return (
//     <NotificationContext.Provider
//       value={{ expoPushToken, notification, error }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };