import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./Auth.scss";
import logo from "../../assets/img/logo.png";

export default function Auth({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", username.trim());
    formData.append("password", password.trim());
    formData.append("grant_type", "password");

    try {
      const response = await fetch("http://195.133.94.240:4545/api/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        Cookies.set("authToken", data.access_token, { secure: true, sameSite: "Strict", expires: 7 });
        Cookies.set("userRole", data.role, { secure: true, sameSite: "Strict", expires: 7 });
        // Cookies.set("username", username, { secure: true, sameSite: "Strict", expires: 7 });
        Cookies.set("user_id", data.user_id,{ secure: true, sameSite: "Strict", expires: 7 } )

        onAuthSuccess();
        navigate("/"); 
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Ошибка при запросе:", err);
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <div className="auth">
      <img src={logo} className="auth_logo logo" alt="Логотип" />
      <form onSubmit={handleSubmit} className="auth_form">
        <p className="auth_title">Авторизация</p>
        <input
          type="text"
          className="auth_input"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          className="auth_input"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="auth_error">{error}</p>}
        <input type="submit" className="auth_submit" value="Вход" />
      </form>
    </div> 
  );
}
