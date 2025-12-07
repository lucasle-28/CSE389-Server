import React from "react";

export default function LoginButton({ authenticated, user }) {
  if (authenticated) {
    return (
      <div className="login-info">
        <span>Signed in as {user?.displayName || user?.email}</span>
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/auth/google";
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
}
