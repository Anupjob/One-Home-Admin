import React, { useState, memo, useEffect } from "react";
import postApiCall from "../Services/postApiCall";
import { decryptBody } from "../Services/helpers";
import styles from "../css/login-page.module.css";
import PasswordInput from "../Utils/PasswordInput";
import { toast, ToastContainer } from "react-toastify";
import OtpInput from 'react-otp-input';

function Login({ modalKey }) {
  const [inputValue, setInputValue] = useState("");
  const [loginType, setLoginType] = useState("null"); // "phone" | "email"
  const [step, setStep] = useState("login"); // login | verify | forgot | forgot-verify
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [partnerUserId, setPartnerUserId] = useState("");
  const [isReady, setIsReady] = useState(true);
  const [error, setError] = useState({}); // inline validation errors
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendOtp, setResendOtp] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // detect login type
  const handleInputChange = (e) => {
    let val = e.target.value.trim();

    if (/^\d+$/.test(val)) {
      // allow only 10 digits for phone
      val = val.slice(0, 10);
      setLoginType("phone");
    } else if (/\S+@\S+\.\S+/.test(val)) {
      setLoginType("email");
    } else {
      setLoginType(null);
    }

    setInputValue(val);
  };
  useEffect(() => {
    setInputValue("");
    setLoginType(null);
    setOtp("");
    setPassword("");
    setNewPassword("");
    setRePassword("");
    setPartnerUserId("");
    setError({});
    setStep('login')
  }, [modalKey]);
  // Send OTP or Continue (for email)
  const sendOtpOrContinue = async (e) => {
    e.preventDefault();
    setError({});
    if (!inputValue) return setError({ input: "Email or Phone is required" });
    if (!loginType) return setError({ input: "Enter valid email or phone" });
    if (!isReady) return;

    setIsReady(false);

    if (loginType === "email") {
      setStep("verify");
      setIsReady(true);
      return;
    }

    let obj = { type: 2, mobile: inputValue };
    try {
      const data = await postApiCall("admin/sendOTP", obj);
      if (data.meta.status) {
        const decryptUserId = decryptBody(data.data.encryptedData);
        setPartnerUserId(decryptUserId.userId);
        toast.success(data.meta.msg);
        setStep("verify");
      } else {
        toast.error(data.meta.msg);
      }
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setIsReady(true);
    }
  };

  // Verify OTP or Password
  const verifyOtpOrPassword = async (e) => {
    e.preventDefault();
    setError({});
    let payload = { partnerUserId, type: loginType === "phone" ? 2 : 1 };

    if (loginType === "phone") {
      if (!otp) return setError({ otp: "OTP is required" });
      payload.otp = otp;
      // payload.phone = inputValue
    } else {
      if (!password) return setError({ password: "Password is required" });
      if (!passwordRegex.test(password)) {
        return setError({
          password:
            "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        });
      }
     payload={
      ...payload,
      email:inputValue,
      password
     } 
      delete payload["partnerUserId"]
      const data = await postApiCall("admin/login", payload);
      if (data.meta.status) {
        // ✅ Never store password
        const { token, ...userData } = data.data;
        // ✅ Use localStorage for sensitive session data
        localStorage.setItem("loginDetails", token);
        localStorage.setItem("userDetails", JSON.stringify(userData));

        window.location.href = "/home";
      } else {
        toast.error(data.meta.msg,{ toastId: data.meta.msg });
      }
      return
    }

    
    try {
      const data = await postApiCall("admin/verifyOTP", payload);
      if (data.meta.status) {
        // ✅ Never store password
        const { token, ...userData } = data.data;
        // ✅ Use localStorage for sensitive session data
        localStorage.setItem("loginDetails", token);
        localStorage.setItem("userDetails", JSON.stringify(userData));

        window.location.href = "/home";
      } else {
        toast.error(data.meta.msg);
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  // Forgot password flow
  const handleForgotPassword = async (e, type = "send") => {
    e.preventDefault();
    setError({});
    if (!inputValue) return setError({ input: "Email is required" });
    if (!/\S+@\S+\.\S+/.test(inputValue))
      return setError({ input: "Enter a valid email" });

    if (!newPassword) return setError({ newPassword: "New password required" });
    if (!passwordRegex.test(newPassword)) {
      return setError({
        newPassword:
          "New Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      });
    }
    if (!rePassword) return setError({ rePassword: "Please retype password" });
    if (newPassword !== rePassword)
      return setError({ rePassword: "Passwords do not match" });

    let obj = {
      email: inputValue,
      password: newPassword,
      confirmPassword: rePassword
    };
    try {
      const data = await postApiCall("admin/reset-password-otp", obj);
      if (data.meta.status) {
        if (type !== "resend") {
          setStep("forgot-verify");
        } else {
          setResendOtp(!resendOtp)
        }
        toast.success(data.meta.msg);
      } else {
        toast.error(data.meta.msg);
      }
    } catch {
      console.log('errrrr catchhhh::::')
      toast.error("Something went wrong!");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!otp) return setError({ otp: "OTP is required" });

    let payload = {
      email: inputValue,
      otp: Number(otp),
      password: newPassword,
    };

    try {
      const data = await postApiCall("admin/reset-password", payload);
      if (data.meta.status) {
        toast.success(data.meta.msg);
        // reset all state
        setStep("login");
        // setInputValue("");
        setPassword("");
        setNewPassword("");
        setRePassword("");
        setOtp("");
        setError({});
      } else {
        toast.error(data.meta.msg);
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleEditPhonEmail = () => {
    setStep("login");
    setPassword('')
    setNewPassword('')
    setRePassword('')
    setOtp('')
  }

  const formatMobile = (num) => {
  if (!num) return "";
  // Ensure it's only digits
  num = num.toString().replace(/\D/g, "");
  // Apply your pattern: XX-XX75-9723
  return `XX-XX${num.slice(4, 6)}-${num.slice(6)}`;
  };

const maskEmail = (email) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  // If username is shorter than 3 chars, show only first char
  const visible = user.slice(0, 3);
  return `${visible}***@${domain}`;
};




  useEffect(() => {
    if ((step === "verify" && loginType === "phone") || step === "forgot-verify") {
      setTimer(30);
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, loginType, resendOtp]);


  return (
    <div className="container11">
      <div className={`row g-0 mx-0 my-0 ${styles["hide-scroll"]}`}>
        <div className={`col-sm-12 col-md-7 col-lg-7 ${styles["left-container"]}`}>
          <div style={{fontWeight:"bold",fontSize:"18px",color:"black"}}><span style={{ color: "#EA5817",fontWeight:"bold"}}>One</span> Home </div>
          <div className={styles["info-container"]}>
            <p className={styles["text-1"]}>One Place Auction </p>
            <h2 className={styles["text-2"]}>
              Simplified <br /> Real Estate Auctions!
            </h2>
            <p className={styles["text-3"]}>
              Effortless Property Management!
              <br />
              Manage your real estate auctions seamlessly with our intuitive
              platform.
            </p>
          </div>
        </div>

        <div className={`${styles["card-container"]} col-sm-12 col-md-5 col-lg-5`}>
          <div className={styles["card-container"]}>
            {/* Login Step */}
            <div className="card-body">
              {(step !== "forgot-verify" && step !== "forgot" && step !== "verify") ? (<>
                <h4 style={{ color: "#EA5817" ,marginBottom:"30px",fontWeight:"600",fontSize:"20px"}}>Login</h4>
                <p style={{ color: "#263C7E", fontSize: "20px", marginBottom:"2px" }}>Welcome to OneHome</p>
                <p style={{ color: "#667085", fontSize: "14px" }}>Login to access your OneHome account</p>

              </>) : <div className="d-flex align-items-center mb-3">
                {/* Back button */}
                <button
                  type="button"
                  className="btn btn-link p-0 mb-2"
                  onClick={() => {
                    setStep("login");
                    setError({});
                    setNewPassword("");
                    setRePassword("");
                  }}
                >
                  <i className="bi bi-arrow-left" style={{ fontSize: "20px", color: "black" }}></i>
                </button>
                {/* <h4 style={{ color: "#EA5817" }}>Forgot Password</h4> */}
              </div>
              }
              {step === "login" && (
                <form onSubmit={sendOtpOrContinue} className={styles["form-container"]}>

                  <div className="form-group mb-3">
                    <label style={{color:"#667085"}}>{loginType === "phone" ? "Phone Number" : (loginType === "email") ? "Email Address" : "Phone Number / Email ID for OTP"}</label>
                    <div className="input-group highlight-group">
                      {loginType === "phone" && (
                        <span className="input-group-text login-country-code ">+91</span>
                      )}
                      <input
                        type={loginType === "phone" ? "number" : "email"}
                        className="form-control"
                        placeholder="Enter Email ID / Mobile No."
                        value={inputValue}
                        maxLength={loginType === "phone" ? 10 : undefined}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {error.input && <small className="text-danger">{error.input}</small>}
                  </div>

                  <button className="btn btn-primary btn-block mt-2" type="submit">
                    {loginType === "phone" ? "Get OTP" : "Continue"}
                  </button>


                </form>
              )}

              {/* Verify Step */}
              {step === "verify" && (
                <form onSubmit={verifyOtpOrPassword} className={styles["form-container"]}>

                  {/* <label>{loginType === "phone" ? "Phone Number" : "Email"}</label>
                  <div className="d-flex align-items-center mb-2">
                    <input
                      className="form-control me-2 mr-1"
                      value={inputValue}
                      disabled={true}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => {
                        handleEditPhonEmail()
                      }}
                    >
                      <i className="bi bi-pencil" style={{ fontSize: "1.2rem", color: '#EF5713' }}></i>
                    </button>
                  </div> */}
                <h4 style={{ color: "#EA5817" ,marginBottom:"30px",fontWeight:"600",fontSize:"20px"}}>Login</h4>
                <p style={{ color: "#263C7E", fontSize: "20px", marginBottom:"2px" }}>{loginType === "phone" ? "OTP Verification" : "Password Verification"}</p>
                <p style={{ color: "#667085", fontSize: "14px" }}> {loginType === "phone" ? `Please enter OTP sent to ${formatMobile(inputValue)}`: `${maskEmail(inputValue)}`}</p>
                  {loginType === "phone" ? (
                    <>
                      <label>Enter OTP</label>
                      {/* <input
                        type="text"
                        className="form-control"
                        placeholder="Enter OTP"
                        value={otp}
                        maxLength={6}
                        onChange={(e) => setOtp(e.target.value)}
                      /> */}
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        containerStyle={styles.otpWrapper}
                        renderInput={(props) => (
                          <input
                            {...props}
                            className={styles.otpInput}   // ✅ Correct way
                          />
                        )}
                      />



                      {error.otp && <small className="text-danger">{error.otp}</small>}

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        {!canResend ? (
                          <small className="text-muted">Resend OTP in {timer}s</small>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={async () => {
                              // 🔹 Call resend OTP API for login
                              let obj = { type: 2, mobile: inputValue };
                              try {
                                const data = await postApiCall("admin/sendOTP", obj);
                                if (data.meta.status) {
                                  toast.success(data.meta.msg);
                                  setResendOtp(!resendOtp)
                                } else {
                                  toast.error(data.meta.msg);
                                }
                              } catch {
                                toast.error("Something went wrong!");
                              }
                            }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <PasswordInput
                        placeholder="Enter Password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error.password || ''}
                      />
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setStep("forgot")}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </>
                  )}


                  <button className="btn btn-primary btn-block mt-3" type="submit">
                    {loginType === "phone" ? "Verify OTP" : "Login"}
                  </button>

                </form>
              )}

              {/* Forgot Password */}
              {step === "forgot" && (
                <form onSubmit={(e) => handleForgotPassword(e, 'send')} className={styles["form-container"]}>
                  <label>Email</label>
                  <input
                    className="form-control mb-2"
                    value={inputValue}
                    onChange={handleInputChange}
                  />
                  {error.input && <small className="text-danger">{error.input}</small>}
                  <PasswordInput
                    placeholder={"New Password"}
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={error.newPassword || ''}
                  />
                  <PasswordInput
                    placeholder={'Re-Enter Password'}
                    label="Re-Enter Password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    error={error.rePassword || ''}
                  />

                  <button className="btn btn-primary btn-block mt-3" type="submit">
                    Send OTP
                  </button>
                </form>
              )}


              {/* Forgot Password Verify */}
              {step === "forgot-verify" && (
                <form onSubmit={resetPassword} className={styles["form-container"]}>
                  <label>Email</label>
                  <input className="form-control mb-2" value={inputValue} disabled />

                  <label>Enter OTP</label>
                  {/* <input
                    type="text"
                    className="form-control"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                  /> */}
                  <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        containerStyle={styles.otpWrapper}
                        renderInput={(props) => (
                          <input
                            {...props}
                            className={styles.otpInput}   // ✅ Correct way
                          />
                        )}
                      />
                  {error.otp && <small className="text-danger">{error.otp}</small>}

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    {!canResend ? (
                      <small className="text-muted">
                        Resend OTP in {timer}s
                      </small>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={async (e) => {
                          handleForgotPassword(e, 'resend')
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button className="btn btn-primary btn-block mt-3" type="submit">
                    Reset Password
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
      <ToastContainer style={{top: '57px' }}/>
    </div>
  );
}

export default Login;
