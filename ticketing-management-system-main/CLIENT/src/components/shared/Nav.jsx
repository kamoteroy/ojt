import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  Dropdown,
  DropdownItem,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  Badge,
} from "@nextui-org/react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthToken from "../../auth/AuthToken.jsx";
import { NavbarData } from "../../data/NavbarData.jsx";
import axiosInstance from "./axiosInstance.jsx";
import { currentFcmToken } from "../../firebase/firebase.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import { useNotification } from "../notification/NotificationContext.jsx";
import addAuditTrail from "./RecordAudit.jsx";
import ModalApp from "./Modal.jsx";

/****************************************************************
 * STATUS               : Done(Tentative)
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Navbar of the Page
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : Nav
 *****************************************************************/
const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const { unreadCount, setUnreadCount } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get(
          `/getnotification/Notification/${currentUserId}`
        );
        const unreadNotifications = response.data.filter(
          (notification) => notification.Status === 0
        );
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();
  }, [currentUserId]);

  const isActive = (path) => {
    const currentPath = location.pathname === path ? "warning" : "";
    return currentPath;
  };

  const handleLogout = async () => {
    if (currentFcmToken) {
      await axiosInstance.post(`/unsubscribe`, {
        UserId: currentUserId,
        Tokens: currentFcmToken,
        UpdatedBy: currentUserId,
      });
    }
    await addAuditTrail(currentUserId, "Logout", null, null);
    window.location.href = "/";
    AuthToken.clearTokens();
  };

  const handleProfile = () => {
    navigate("/profile");
  };
  const handleAudit = () => {
    navigate("/audittrail");
  };
  return (
    <Navbar isBordered className="py-2 relative">
      {/* Web Navbar */}
      <NavbarContent className="flex gap-4" justify="end">
        {NavbarData.map((item, index) => (
          <NavbarItem key={index}>
            <Link
              color={isActive(item.path)}
              underline={isActive(item.path) ? "always" : ""}
              onClick={() => navigate("/notification")}
              className="font-bold hover:text-warning pt-2 cursor-pointer"
            >
              <Badge content={`${unreadCount}`} color="danger">
                {item.title}
              </Badge>
            </Link>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem
                key="profile"
                color="primary"
                className="w-full"
                onClick={handleProfile}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="audit"
                color="primary"
                className="w-full"
                onClick={handleAudit}
              >
                Audit Trail
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="w-full"
                onClick={() => setIsModalOpen(true)}
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
      <ModalApp
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Logout"
        content="Are you sure you want to logout?"
        actionButtonLabel="Confirm"
        actionButtonOnClick={() => handleLogout()}
      />
    </Navbar>
  );
};

export default Nav;
