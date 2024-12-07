import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginRegister.css";
import axios from "axios";
import { message } from "antd";

const LOGIN_PATH = "https://prod-14.northcentralus.logic.azure.com:443/workflows/cb6bd67ac7f64bcdb52a985a89ae8ef6/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=jYqYDJUhs6XsVv1PO84Wd6MLW1rb3dUDzg2MXZKGBHs"



const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(
            LOGIN_PATH,
          {
            account,
            password,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
  
        if (response.status === 200) {
            const data = response.data;
          
            // 判断 value 数组是否有数据
            if (data.value && data.value.length > 0) {
              const user = data.value[0]; // 获取数组中的第一个用户
              const { id, user_name } = user;
          
              // 存储到 sessionStorage
              sessionStorage.setItem("user_id", id);
              sessionStorage.setItem("user_name", user_name);
              navigate("/list"); // 跳转到列表页面
            } else {
              // value 数组为空，登录失败
              message.error("Login failed: Invalid account or password");
            }
          } else {
            // 响应码不是 200
            message.error("An error occurred during login");
          }
      } catch (err) {
        message.error(err.response?.data?.message || "An error occurred");
      }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="account">Account</label>
          <input type="text" id="account" value={account} 
          onChange={(e) => setAccount(e.target.value)} placeholder="Enter your account" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
        </div>
        <button type="submit" className="form-button">
          Login
        </button>
      </form>
      <p className="switch-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;