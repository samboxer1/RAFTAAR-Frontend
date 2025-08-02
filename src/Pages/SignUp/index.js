import React from 'react';
import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.jpg";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import GoogleImg from "../../assets/images/googleImg.png";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formfields, setFormfields] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isAdmin: false,
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);
    return () => {
      context.setisHeaderFooterShow(true);
    };
  }, [context]);

  const onchangeInput = (e) => {
    setFormfields(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const register = (e) => {
    e.preventDefault();
    
    if (!formfields.name.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Name cannot be blank!",
      });
      return;
    }

    if (!formfields.email.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Email cannot be blank!",
      });
      return;
    }

    if (!formfields.phone.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Phone cannot be blank!",
      });
      return;
    }

    if (!formfields.password.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password cannot be blank!",
      });
      return;
    }

    setIsLoading(true);

    postData("/api/user/signup", formfields)
      .then((res) => {
        if (res.status !== 'FAILED') {
          context.setAlertBox({
            open: true,
            error: false,
            msg: res?.msg,
          });

          setTimeout(() => {
            history("/signIn");
          }, 2000);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg,
          });
          setIsLoading(false);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error posting data:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "An error occurred during registration",
        });
      });
  };

  const signInWithGoogle = () => {
    setIsLoading(true);
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        const fields = {
          name: user.providerData[0].displayName,
          email: user.providerData[0].email,
          password: null,
          images: user.providerData[0].photoURL,
          phone: user.providerData[0].phoneNumber
        };

        return postData("/api/user/authWithGoogle", fields);
      })
      .then((res) => {
        if (!res.error) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify({
            name: res.user?.name,
            email: res.user?.email,
            userId: res.user?.id,
          }));

          context.setAlertBox({
            open: true,
            error: false,
            msg: res.msg,
          });

          setTimeout(() => {
            history("/");
            context.setIsLogin(true);
            context.setisHeaderFooterShow(true);
          }, 2000);
        } else {
          throw new Error(res.msg);
        }
      })
      .catch((error) => {
        console.error("Google auth error:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: error.message || "Google authentication failed",
        });
        setIsLoading(false);
      });
  };

  return (
    <section className="section signInPage signUpPage">
      <div className="shape-bottom">
        <svg
          fill="#fff"
          id="Layer_1"
          x="0px"
          y="0px"
          viewBox="0 0 1921 819.8"
          style={{ enableBackground: "new 0 0 1921 819.8" }}
          aria-hidden="true"
        >
          <path
            className="st0"
            d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
          ></path>
        </svg>
      </div>

      <div className="container">
        <div className="box card p-3 shadow border-0">
          <div className="text-center">
            <img src={Logo} alt="Website Logo" width="150" height="auto" />
          </div>

          <form className="mt-2" onSubmit={register}>
            <h1 className="mb-3">Sign Up</h1>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <TextField
                    label="Name"
                    name="name"
                    onChange={onchangeInput}
                    type="text"
                    variant="standard"
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <TextField
                    label="Phone No."
                    name="phone"
                    onChange={onchangeInput}
                    type="tel"
                    variant="standard"
                    className="w-100"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <TextField
                label="Email"
                type="email"
                name="email"
                onChange={onchangeInput}
                variant="standard"
                className="w-100"
                required
              />
            </div>
            <div className="form-group">
              <TextField
                label="Password"
                name="password"
                onChange={onchangeInput}
                type="password"
                variant="standard"
                className="w-100"
                required
              />
            </div>

            <div className="d-flex align-items-center mt-3 mb-3">
              <div className="row w-100">
                <div className="col-md-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-blue w-100 btn-lg btn-big"
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </div>
                <div className="col-md-6 pr-0">
                  <Link to="/" className="d-block w-100">
                    <Button
                      className="btn-lg btn-big w-100"
                      variant="outlined"
                      onClick={() => context.setisHeaderFooterShow(true)}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <p className="txt">
              Already have an account?{" "}
              <Link to="/signIn" className="border-effect">
                Sign In
              </Link>
            </p>

            <h2 className="mt-4 text-center font-weight-bold">
              Or continue with social account
            </h2>

            <Button
              className="loginWithGoogle mt-2"
              variant="outlined"
              onClick={signInWithGoogle}
              disabled={isLoading}
              startIcon={<img src={GoogleImg} alt="Google logo" width="20" />}
            >
              Sign Up with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;