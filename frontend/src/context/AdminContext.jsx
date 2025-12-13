import { createContext, useContext } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children, value }) => {
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin doit être utilisé dans AdminProvider');
  }
  return context;
};

