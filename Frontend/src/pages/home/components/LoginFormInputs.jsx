import React from "react";

function LoginFormInputs({
  role,
  username,
  setUsername,
  password,
  setPassword,
}) {
  const isDonor = role === "donors";

  const handleForgotClick = (e) => {
    e.preventDefault();
    alert("Password reset instructions have been sent to your email.");
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="login-form-inputs">
      <div className="form-group">
        <label htmlFor="username-email">
          {isDonor ? "Username or Email" : "Email or Username"}
        </label>

        <div className="input-wrapper">
          <input
            id="username-email"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder={
              isDonor
                ? "Enter donor username or email"
                : "Enter receiver email or username"
            }
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="label-with-forgot">
          <label htmlFor="password">Password</label>

          <a
            href="#forgot-password"
            onClick={handleForgotClick}
            className="forgot-password-link"
          >
            Forgot Password?
          </a>
        </div>

        <div className="input-wrapper">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder=". . . . . . . . . . . ."
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginFormInputs;