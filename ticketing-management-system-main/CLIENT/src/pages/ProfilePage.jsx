import React from "react";
import ParentPage from "../components/shared/ParentPage";
import UserProfile from "../components/profile/UserProfile";

const ProfilePage = () => {
  return (
    <ParentPage>
      <UserProfile />
    </ParentPage>
  );
};

export default ProfilePage;
