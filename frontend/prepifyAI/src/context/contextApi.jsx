import React, { createContext } from "react";

const contextApi = createContext();

export const ContextProvider = ({ children }) => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const serverUrl = apiUrl 
        ? apiUrl.replace(/\/api\/?$/, "") 
        : `http://${window.location.hostname}:5000`;

    return (
        <contextApi.Provider value={{ serverUrl }}>
            {children}
        </contextApi.Provider>
    );
};

export default contextApi;