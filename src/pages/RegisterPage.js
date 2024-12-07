import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginRegister.css";
import { message } from "antd";


const REGISTER_PATH = "https://prod-01.northcentralus.logic.azure.com:443/workflows/156a65cd53894c2fa18af6da62e74fe6/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=1rxUUMfWcMwMOwRtAZcDJ5UWZFcE7G4l7MzWZ3gMr5k"
const CHECK_ACCOUNT_PATH = "https://prod-04.northcentralus.logic.azure.com:443/workflows/eb3365194ba94e4495f7110eebfdd647/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=KiwibcxlRZXJh3AKdgSdDYrsewShigwQ5OwGYz272v4"


const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    account: "",
    password: "",
    user_name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { account, password, user_name } = formData;
    try {
        // 1. 调用账户验证 API
      const checkResponse = await axios.post(
        CHECK_ACCOUNT_PATH,
        { account },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // 判断账户是否已存在
      if (checkResponse.status === 200) {
        const data = checkResponse.data;
        if (data.value && data.value.length > 0) {
          message.error("Account already exists. Please use a different account.");
          return;
        }
      }



        // 调用后端 API 提交注册数据
        const response = await axios.post(
            REGISTER_PATH,
            { account, password, user_name },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
  
        if (response.status === 200) {
          navigate("/"); // 跳转到登录页面
        } else {
            message.error(response.data.message || "Registration failed");
        }
      } catch (err) {
        message.error(err.response?.data?.message || "An error occurred");
      }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="account">Account</label>
          <input type="text" id="account" name="account"  value={formData.account}
            onChange={handleInputChange} placeholder="Enter your account" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password"  value={formData.password}
            onChange={handleInputChange} placeholder="Enter your password" required />
        </div>
        <div className="form-group">
          <label htmlFor="nickname">Nickname</label>
          <input type="text" id="nickname" name="user_name" value={formData.user_name}
            onChange={handleInputChange} placeholder="Enter your nickname" required />
        </div>
        <button type="submit" className="form-button">
          Register
        </button>
      </form>
      <p className="switch-link">
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;