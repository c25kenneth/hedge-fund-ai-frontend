import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import ChatApp from './ChatApp';
import AuthenticateUser from './pages/AuthenticateUser';
import { supabase } from "../supabaseClient";

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const response = await fetch("http://127.0.0.1:5000/createUser", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: session.user.id }),
            });

            const text = await response.text();
            console.log("Server response:", text);
            setCreated(true);
          } catch (error) {
            console.error("Error creating user:", error);
          }
        }

        if (event === 'SIGNED_OUT') {
          setCreated(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<AuthenticateUser />} />
        <Route
          path="/chat"
          element={session ? <ChatApp /> : <Navigate to="/signin" />}
        />
        
        <Route
          path="*"
          element={<Navigate to={session ? '/chat' : '/signin'} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
