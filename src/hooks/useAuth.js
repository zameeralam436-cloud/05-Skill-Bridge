import { useState, useEffect } from 'react';

// Placeholder custom hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return { user, loading };
};

export default useAuth;
