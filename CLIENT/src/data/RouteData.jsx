import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import UserPage from "../pages/UserPage";
import RolesPage from "../pages/RolePage";
import AddUserPage from "../pages/AddUserPage";
import RoleDetails from "../pages/RoleDetailsPage";
import EditUserPage from "../pages/EditUserPage";
import UserDetailsPage from "../pages/UserDetailsPage";
import TicketsPage from "../pages/TicketsPage";
import AddTicketPage from "../pages/AddTicketPage";
import TicketDetailsPage from "../pages/TicketDetailsPage";
import ProductPage from "../pages/ProductPage";
import DepartmentPage from "../pages/DepartmentPage";
import ClientPage from "../pages/ClientPage";
import AddClientPage from "../pages/AddClientPage";
import EditClientPage from "../pages/EditClientPage";
import ClientDetailsPage from "../pages/ClientDetailsPage";
import EditTicketPage from "../pages/EditTicketPage";
import AccessRightPage from "../pages/AccessRightPage";
import NotificationPage from "../pages/NotificationPage";
import TicketReviewPage from "../pages/TicketReviewPage";
import AuditTrailPage from "../pages/AuditTrailPage";

// Define route objects
export const RoutesData = [
  { path: "/", element: <DashboardPage /> },
  { path: "/users", element: <UserPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/users/addusers", element: <AddUserPage /> },
  { path: "/users/editusers/:userId", element: <EditUserPage /> },
  { path: "/users/userdetails/:userId", element: <UserDetailsPage /> },
  { path: "/roles", element: <RolesPage /> },
  { path: "/roles/roledetails/:id", element: <RoleDetails /> },
  { path: "/accessrights", element: <AccessRightPage /> },
  { path: "/tickets", element: <TicketsPage /> },
  { path: "/tickets/addtickets", element: <AddTicketPage /> },
  { path: "/tickets/ticketdetails/:ticketid", element: <TicketDetailsPage /> },
  { path: "/tickets/ticketreview/:ticketid", element: <TicketReviewPage /> },
  { path: "/tickets/editticket/:ticketid", element: <EditTicketPage /> },
  { path: "/products", element: <ProductPage /> },
  { path: "/departments", element: <DepartmentPage /> },
  { path: "/clients", element: <ClientPage /> },
  { path: "/clients/addclient", element: <AddClientPage /> },
  { path: "/clients/editclient/:clientId", element: <EditClientPage /> },
  { path: "/clients/clientdetail/:clientId", element: <ClientDetailsPage /> },
  { path: "/notification", element: <NotificationPage /> },
  { path: "/audittrail", element: <AuditTrailPage /> },
];
