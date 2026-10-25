import React from "react";

function LoginButton({ role }) {
  const roleLabel = role === "donors" ? "Donor" : "Receiver";

  return (
    <button type="submit" className="login-submit-btn">
      Login as {roleLabel}
    </button>
  );
}

export default LoginButton;
