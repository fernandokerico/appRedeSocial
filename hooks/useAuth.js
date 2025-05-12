// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Certifique-se de que o caminho do arquivo firebase está correto

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, authLoading };
};

export default useAuth;
