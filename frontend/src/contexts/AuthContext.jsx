import axios from "axios";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", { username, password });
      setUserData(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });
      return response.data.message;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, handleLogin, handleRegister }}
    >
      {children}
    </AuthContext.Provider>
  );
};
