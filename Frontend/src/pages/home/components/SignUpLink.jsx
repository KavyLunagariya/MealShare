import React from "react";
import { Link } from "react-router-dom";

function SignUpLink() {
  return (
    <div className="signup-prompt">
      <span>Don't have an account? </span>
      <Link to="/signup" className="signup-link">
        Sign Up
      </Link>
    </div>
  );
}

export default SignUpLink;
