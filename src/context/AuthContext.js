import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useData } from "./DataContext";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { customers, addCustomer } = useData();

  // --- 1. INITIALIZE STATE FROM LOCAL STORAGE ---
  // Instead of starting as "guest", we check if there is a saved user first.
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("activeUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "guest";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("activeUser"); // true if user exists
  });

  // --- 2. SYNC WITH LOCAL STORAGE ---
  // Whenever the user changes, update Local Storage automatically
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("activeUser", JSON.stringify(currentUser));
      localStorage.setItem("userRole", userRole);
    } else {
      localStorage.removeItem("activeUser");
      localStorage.removeItem("userRole");
    }
  }, [currentUser, userRole]);

  // --- LOGIN FUNCTION ---
  const login = useCallback(
    (username, password) => {
      // A. Admin Login
      if (username === "admin" && password === "admin") {
        const adminUser = { name: "Admin", id: "ADM001" };

        setUserRole("admin");
        setIsLoggedIn(true);
        setCurrentUser(adminUser);
        return { success: true, userRole: "admin" };
      }

      // B. Customer Login
      const foundCustomer = customers.find(
        (c) =>
          c.name.toLowerCase() === username.toLowerCase() ||
          c.phone === username
      );

      if (foundCustomer) {
        setUserRole("customer");
        setIsLoggedIn(true);
        setCurrentUser(foundCustomer);
        return { success: true, userRole: "customer" };
      }

      return { success: false, message: "Invalid credentials." };
    },
    [customers]
  );

  // --- SIGNUP FUNCTION ---
  const signup = useCallback(
    (name, phone) => {
      const existing = customers.find((c) => c.phone === phone);
      if (existing)
        return { success: false, message: "Phone number already exists." };

      const newCustomer = addCustomer({ name, phone });

      // Auto-login after signup
      setUserRole("customer");
      setIsLoggedIn(true);
      setCurrentUser(newCustomer);

      return { success: true, message: "Account created!" };
    },
    [customers, addCustomer]
  );

  // --- LOGOUT FUNCTION ---
  const logout = useCallback(() => {
    setUserRole("guest");
    setIsLoggedIn(false);
    setCurrentUser(null);

    // Explicitly clear storage immediately (optional, as useEffect handles it too)
    localStorage.removeItem("activeUser");
    localStorage.removeItem("userRole");
  }, []);

  const value = useMemo(
    () => ({
      userRole,
      isLoggedIn,
      currentUser,
      login,
      logout,
      signup,
      isAdmin: userRole === "admin",
      isCustomer: userRole === "customer",
    }),
    [userRole, isLoggedIn, currentUser, login, logout, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
