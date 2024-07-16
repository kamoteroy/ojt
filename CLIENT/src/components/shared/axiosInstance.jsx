import axios from "axios";
import { BASE_URL } from "../../routes/BaseUrl";
import AuthToken from "../../auth/AuthToken";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const storedToken = await AuthToken.getAccessToken();
  const refreshToken = await AuthToken.getRefreshToken();
  config.headers.Authorization = storedToken;
  config.headers["Refresh-Token"] = refreshToken;

  return config;
});

export default axiosInstance;
