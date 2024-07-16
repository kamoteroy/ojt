import localforage from "localforage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { BASE_URL } from "../routes/BaseUrl";
import { useState } from "react";
import axiosInstance from "../components/shared/axiosInstance";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const AuthToken = {
  getAccessToken: async () => {
    try {
      const accessToken = await localforage.getItem(ACCESS_TOKEN_KEY);
      return accessToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      const refreshToken = await localforage.getItem(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  isAccessTokenExpired: (accessToken) => {
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error("Error decoding access token:", error);
      return true;
    }
  },

  isRefreshTokenExpired: (refreshToken) => {
    try {
      const decodedToken = jwtDecode(refreshToken);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error("Error decoding refresh token:", error);
      return true;
    }
  },

  isAuthenticated: async (refreshToken) => {
    try {
      if (refreshToken && AuthToken.isRefreshTokenExpired(refreshToken)) {
        await AuthToken.clearTokens();
        return false;
      }
      return !!refreshToken;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  },

  setRenewedToken: async (accessToken) => {
    try {
      if (accessToken && AuthToken.isAccessTokenExpired(accessToken)) {
        console.log("Facts");
        const refreshResponse = await axiosInstance.get(`/verify`);
        const newAccessToken = refreshResponse.data.accessToken;
        await localforage.setItem("accessToken", newAccessToken);
      }
    } catch (error) {
      console.error("Error setting renewed token!", error);
    }
  },

  setTokens: async (accessToken, refreshToken) => {
    try {
      await localforage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await localforage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error("Error setting tokens:", error);
    }
  },

  getCurrentUser: async () => {
    try {
      const currentUser = await axiosInstance.get(`/getcurrentuser/User`);
      return currentUser.data;
    } catch (error) {
      console.error("Error getting current User", error);
    }
  },

  clearTokens: async () => {
    try {
      await localforage.removeItem(ACCESS_TOKEN_KEY);
      await localforage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  },
};

export default AuthToken;
