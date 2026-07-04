import React, { createContext, useContext } from "react";

// Lets any ExpertMind section trigger the extraction console without prop-drilling.
const EmLaunchContext = createContext(() => {});

export const EmLaunchProvider = EmLaunchContext.Provider;
export const useEmLaunch = () => useContext(EmLaunchContext);