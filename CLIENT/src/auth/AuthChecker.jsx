import { useEffect, useState } from "react";
import AuthToken from "./AuthToken";
import axiosInstance from "../components/shared/axiosInstance";
import { useCurrentUser } from "./CurrentUserContext";
import { jwtDecode } from "jwt-decode";
import ToasterUtils from "../components/shared/ToasterUtils";
import { toast } from "react-toastify";

const AuthChecker = () => {
  const { setCurrentUserId } = useCurrentUser();
  const [login, setLogin] = useState(false);
  const { showToast } = ToasterUtils();

  useEffect(() => {
    const checkAccessTokenExpiration = async () => {
      const accessToken = await AuthToken.getAccessToken();
      if (accessToken && AuthToken.isAccessTokenExpired(accessToken)) {
        await AuthToken.setRenewedToken(accessToken);
      }
    };

    const handleContinueLogin = async () => {
      const refreshData = await axiosInstance.get("/refresh");
      const data = refreshData.data;
      if (data.accessToken && data.refreshToken) {
        console.log("New Data", data);
        await AuthToken.setTokens(data.accessToken, data.refreshToken);
      }
    };

    const verifyTokens = async () => {
      try {
        const res = await axiosInstance.get(`/verify`);
        if (res.data.valid) {
          setLogin(true);
          const refreshToken = await AuthToken.getRefreshToken();
          if (refreshToken) {
            const currentUserData = await AuthToken.getCurrentUser();
            const currentUserId = currentUserData.Id;
            setCurrentUserId(currentUserId);
          }
        } else {
          toast.dismiss();
          AuthToken.clearTokens();
          setLogin(false);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const checkRefreshTokenExpiration = async () => {
      const refreshToken = await AuthToken.getRefreshToken();
      if (refreshToken) {
        const decodedToken = jwtDecode(refreshToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = decodedToken.exp - currentTime;
        if (expiresIn <= 300 && expiresIn >= 180) {
          showToast(
            "You are about to be logged out, do you want to continue logging in?",
            "Yes",
            "No",
            handleContinueLogin,
            "warn",
            { toastId: "relogin", autoClose: false }
          );
        }
      }
    };

    const checkTokenExpiration = async () => {
      await checkAccessTokenExpiration();
      await verifyTokens();
      await checkRefreshTokenExpiration();
    };

    checkTokenExpiration();

    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 60000);

    return () => clearInterval(tokenCheckInterval);
  }, [setCurrentUserId]);
  return login;
};

export default AuthChecker;
