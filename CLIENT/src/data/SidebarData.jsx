import { HomeIcon } from "../icons/HomeIcon";
import { UserIcon } from "../icons/UserIcon";
import { TicketIcon } from "../icons/TicketIcon";
import { ProductIcon } from "../icons/ProductIcon";
import { DepartmentIcon } from "../icons/DepartmentIcon";
import { ClientIcon } from "../icons/ClientIcon";
import { AccessRightIcon } from "../icons/AccessRightIcon";

// Define navigation items
export const SidebarData = [
  { path: "/", text: "Dashboard", icon: <HomeIcon />, permissions: null },
  {
    path: "/users",
    text: "Users",
    icon: <UserIcon />,
    permissions: "ViewAllUser",
  },
  {
    path: "/roles",
    text: "Roles",
    icon: <UserIcon />,
    permissions: "ViewAllRole",
  },
  {
    path: "/accessrights",
    text: "Access Rights",
    icon: <AccessRightIcon />,
    permissions: "ViewAllAccessRight",
  },
  {
    path: "/tickets",
    text: "Tickets",
    icon: <TicketIcon />,
    permissions: "ViewAllTicket",
  },
  {
    path: "/products",
    text: "Products",
    icon: <ProductIcon />,
    permissions: "ViewAllProduct",
  },
  {
    path: "/departments",
    text: "Departments",
    icon: <DepartmentIcon />,
    permissions: "ViewAllDepartment",
  },
  {
    path: "/clients",
    text: "Clients",
    icon: <ClientIcon />,
    permissions: "ViewAllClient",
  },
];
