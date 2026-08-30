import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    timeSlot: 'all',
  });
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '', // National Identity Card
  });
  const [currentBooking, setCurrentBooking] = useState(null);

  const setSearchCriteria = (params) => {
    setSearchParams(params);
  };

  const selectBus = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]); // Reset seats when bus changes
  };

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  const savePassengerDetails = (details) => {
    setPassengerDetails(details);
  };

  const completeBooking = (bookingResult) => {
    setCurrentBooking(bookingResult);
  };

  const resetBookingFlow = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassengerDetails({
      name: '',
      email: '',
      phone: '',
      nic: '',
    });
  };

  return (
    <BookingContext.Provider
      value={{
        searchParams,
        setSearchCriteria,
        selectedBus,
        selectBus,
        selectedSeats,
        toggleSeat,
        clearSelectedSeats,
        passengerDetails,
        savePassengerDetails,
        currentBooking,
        completeBooking,
        resetBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
