import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";

const GetPermission = () => {
  const [permissions, setPermissions] = useState([]);
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const getPermission = await axiosInstance.get(`/verify`);
        console.log(getPermission.data.permission);
        setPermissions(getPermission.data.permission);
      } catch (error) {
        console.error("Error getting Permission", error);
      }
    };

    fetchPermissions();
  }, []);
  return permissions;
};

export default GetPermission;
