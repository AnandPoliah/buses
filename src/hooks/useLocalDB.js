import { useState, useEffect } from "react";
import initialData from "../data/initialData.json";

export const useLocalDB = (key) => {
  // Lazy initialization of state
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      const parsed = storedValue ? JSON.parse(storedValue) : null;

      // Return parsed data if it's a valid array, otherwise use fallback
      return Array.isArray(parsed) ? parsed : initialData[key] || [];
    } catch (error) {
      console.warn(
        `Error reading key '${key}' from local storage. Using default data.`
      );
      return initialData[key] || [];
    }
  });

  // Sync state changes to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving key '${key}' to local storage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
};
