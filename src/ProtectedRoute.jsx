import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function RequireAuth({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }
    getSession();

    supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return session ? children : <Navigate to="/signin" replace />;
}

export default RequireAuth