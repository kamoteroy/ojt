import React, { createContext, useContext, useState } from "react";

const CurrentUserContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(null);

  return (
    <CurrentUserContext.Provider value={{ currentUserId, setCurrentUserId }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};
