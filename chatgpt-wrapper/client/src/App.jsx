import React, { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import ChatBox from "./components/ChatBox";

function App() {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    user: null,
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });
        const data = await res.json();
        setAuthState({
          loading: false,
          authenticated: data.authenticated,
          user: data.user || null,
        });
      } catch (err) {
        setAuthState({
          loading: false,
          authenticated: false,
          user: null,
        });
      }
    };
    fetchMe();
  }, []);

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  if (!authState.authenticated) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>ChatGPT Wrapper</h2>
        <LoginButton
          authenticated={false}
          user={null}
        />
        <p>You must sign in with Google to use the chat.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>ChatGPT Wrapper</h2>
      <LoginButton
        authenticated={true}
        user={authState.user}
      />
      <ChatBox />
    </div>
  );
}

export default App;
