import { HomeIcon } from "../icons/HomeIcon";
import { UserIcon } from "../icons/UserIcon";
import { TicketIcon } from "../icons/TicketIcon";
import { ProductIcon } from "../icons/ProductIcon";
import { DepartmentIcon } from "../icons/DepartmentIcon";
import { ClientIcon } from "../icons/ClientIcon";
import { AccessRightIcon } from "../icons/AccessRightIcon";

// Define navigation items
export const SidebarData = [
  { path: "/", text: "Dashboard", icon: <HomeIcon /> },
  { path: "/users", text: "Users", icon: <UserIcon /> },
  { path: "/roles", text: "Roles", icon: <UserIcon /> },
  { path: "/accessrights", text: "Access Rights", icon: <AccessRightIcon /> },
  { path: "/tickets", text: "Tickets", icon: <TicketIcon /> },
  { path: "/products", text: "Products", icon: <ProductIcon /> },
  { path: "/departments", text: "Departments", icon: <DepartmentIcon /> },
  { path: "/clients", text: "Clients", icon: <ClientIcon /> },
  { path: "/reports", text: "Reports", icon: <ClientIcon /> },
];
