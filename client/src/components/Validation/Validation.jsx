import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEmail from "../../hooks/useEmail";
import usePassword from "../../hooks/usePassword";
import useBlurHandler from "../../hooks/useBlurHandler";
import * as styles from "./Validation.module.scss";

function Validation() {
  const { email, emailError, emailHandler } = useEmail("");
  const { password, passwordError, passwordHandler } = usePassword("");
  const { fieldsDirty, blurHandler } = useBlurHandler();

  const [formValid, setFormValid] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [checkboxActive, setCheckboxActive] = useState(false);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmHandle, setConfirmHandle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFormValid(
      !(emailError || passwordError || !checkboxActive || confirmError)
    );
  }, [emailError, passwordError, confirmError, checkboxActive]);

  useEffect(() => {
    setConfirmHandle(!(passwordError || !password));
  }, [passwordError, password]);

  const confirmHandler = (e) => {
    setConfirm(e.target.value);
    setConfirmError(
      e.target.value !== password ? "Passwords do not match" : ""
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formValid) return;

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        console.log(data.token)
        localStorage.setItem("userId", data.user.id);
        navigate("/settings");
      } else {
        setErrorMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Server error, please try again later");
    }
  };

  return (
    <div className={styles.validationWrapper}>
      <form className={styles.validationForm} onSubmit={submitHandler}>
        <h1 className={styles.title}>Registration</h1>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            onChange={emailHandler}
            onBlur={blurHandler}
            value={email}
            type="text"
            placeholder="Your email"
            name="email"
          />
          {fieldsDirty.email && emailError && (
            <div className={styles.error}>{emailError}</div>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            onChange={passwordHandler}
            onBlur={blurHandler}
            value={password}
            type="password"
            placeholder="Password"
            name="password"
          />
          {fieldsDirty.password && passwordError && (
            <div className={styles.error}>{passwordError}</div>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="confirm">
            Confirm Password
          </label>
          <input
            required
            className={styles.input}
            disabled={!confirmHandle}
            onChange={confirmHandler}
            onBlur={blurHandler}
            value={confirm}
            type="password"
            placeholder="Confirm Password"
            name="confirm"
          />
          {fieldsDirty.confirm && confirmError && (
            <div className={styles.error}>{confirmError}</div>
          )}
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            className={styles.checkBox}
            checked={checkboxActive}
            onChange={(e) => setCheckboxActive(e.target.checked)}
            name="agreement"
          />
          <span>I accept the terms and privacy policy</span>
        </div>

        <button
          className={styles.saveButton}
          disabled={!formValid}
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Validation;
