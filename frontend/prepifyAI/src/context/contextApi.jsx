import React, { createContext } from "react";

const contextApi = createContext();

export const ContextProvider = ({ children }) => {

    const serverUrl = `http://${window.location.hostname}:5000`;

    return (
        <contextApi.Provider value={{ serverUrl }}>
            {children}
        </contextApi.Provider>
    );
};

export default contextApi;