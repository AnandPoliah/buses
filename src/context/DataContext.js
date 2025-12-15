import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useLocalDB } from "../hooks/useLocalDB";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // --- 1. Load Data Hooks ---
  const [routes, setRoutes] = useLocalDB("routes");
  const [buses, setBuses] = useLocalDB("buses");
  const [schedules, setSchedules] = useLocalDB("schedules");
  const [bookings, setBookings] = useLocalDB("bookings");
  const [customers, setCustomers] = useLocalDB("customers");

  // --- 2. Route Functions ---
  const addRoute = useCallback(
    (newRoute) => {
      const routeWithId = { ...newRoute, routeId: `R${Date.now()}` };
      setRoutes((prev) => [...prev, routeWithId]);
    },
    [setRoutes]
  );

  const deleteRoute = useCallback(
    (routeId) => {
      // Safety: Check if used in schedules
      const isUsed = schedules.some((s) => s.routeId === routeId);
      if (isUsed) {
        alert(
          "Cannot delete this route because active bus schedules are using it."
        );
        return;
      }
      setRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
    },
    [schedules, setRoutes]
  );

  // --- 3. Bus Functions ---
  const addBus = useCallback(
    (newBus) => {
      const busWithId = { ...newBus, busId: `B${Date.now()}` };
      setBuses((prev) => [...prev, busWithId]);
    },
    [setBuses]
  );

  const deleteBus = useCallback(
    (busId) => {
      // Safety: Check if used in schedules
      const isUsed = schedules.some((s) => s.busId === busId);
      if (isUsed) {
        alert(
          "Cannot delete this bus because it is assigned to active schedules."
        );
        return;
      }
      setBuses((prev) => prev.filter((b) => b.busId !== busId));
    },
    [schedules, setBuses]
  );

  // --- 4. Schedule Functions (UPDATED) ---
  const addSchedule = useCallback(
    (newSchedule) => {
      const scheduleWithId = { ...newSchedule, scheduleId: `SCD${Date.now()}` };
      setSchedules((prev) => [...prev, scheduleWithId]);
    },
    [setSchedules]
  );

  // ⚠️ NEW: Delete Schedule
  const deleteSchedule = useCallback(
    (scheduleId) => {
      // Safety: Don't delete if there are active bookings for this trip
      const hasActiveBookings = bookings.some(
        (b) => b.scheduleId === scheduleId && b.status !== "Cancelled"
      );

      if (hasActiveBookings) {
        alert(
          "Cannot delete this schedule because passengers have already booked tickets. Cancel their bookings first."
        );
        return;
      }

      setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
    },
    [bookings, setSchedules]
  );

  // --- 5. Booking & Customer Functions (UPDATED) ---
  const updateBooking = useCallback(
    (bookingData) => {
      if (bookingData.bookingId) {
        // Edit existing
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === bookingData.bookingId ? { ...b, ...bookingData } : b
          )
        );
      } else {
        // Create new
        const bookingWithId = { ...bookingData, bookingId: `BK${Date.now()}` };
        setBookings((prev) => [...prev, bookingWithId]);
        return bookingWithId.bookingId;
      }
    },
    [setBookings]
  );

  // ⚠️ NEW: Cancel Booking
  const cancelBooking = useCallback(
    (bookingId) => {
      // We don't delete bookings (financial record), we just change status
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
    },
    [setBookings]
  );

  const addCustomer = useCallback(
    (newCustomerData) => {
      const customerId = `CUST${Date.now()}`;
      const newCustomer = {
        ...newCustomerData,
        customerId,
        lifetimeBookings: 0,
        loyaltyDiscount: 0.0,
      };
      setCustomers((prev) => [...prev, newCustomer]);
      return newCustomer;
    },
    [setCustomers]
  );

  // --- 6. Context Value ---
  const contextValue = useMemo(
    () => ({
      // Data
      routes,
      buses,
      schedules,
      bookings,
      customers,

      // Functions
      addRoute,
      deleteRoute,
      addBus,
      deleteBus,
      addSchedule,
      deleteSchedule, // <--- Added
      updateBooking,
      cancelBooking, // <--- Added
      addCustomer,
    }),
    [
      routes,
      buses,
      schedules,
      bookings,
      customers,
      addRoute,
      deleteRoute,
      addBus,
      deleteBus,
      addSchedule,
      deleteSchedule,
      updateBooking,
      cancelBooking,
      addCustomer,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};
