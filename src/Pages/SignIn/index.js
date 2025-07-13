import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import PropTypes from 'prop-types';

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const SignIn = ({ onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formFields, setFormFields] = useState({
        email: "",
        password: "",
    });
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        context.setisHeaderFooterShow(false);
        context.setEnableFilterTab(false);
    }, [context]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormFields(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!formFields.email) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Email is required"
            });
            return;
        }

        if (!formFields.password) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Password is required"
            });
            return;
        }

        setIsLoading(true);
        
        try {
            const res = await postData("/api/user/signin", formFields);
            
            if (res.error) {
                throw new Error(res.msg);
            }

            localStorage.setItem("token", res.token);
            const user = {
                name: res.user?.name,
                email: res.user?.email,
                userId: res.user?.id,
                image: res.user?.images?.[0]
            };
            localStorage.setItem("user", JSON.stringify(user));
            context.setUser(user);

            context.setAlertBox({
                open: true,
                error: false,
                msg: "Login successful"
            });

            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/");
                context.setIsLogin(true);
                context.setisHeaderFooterShow(true);
            }
        } catch (error) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: error.message || "Login failed"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            const fields = {
                name: user.displayName,
                email: user.email,
                password: null,
                images: user.photoURL,
                phone: user.phoneNumber
            };

            const res = await postData("/api/user/authWithGoogle", fields);
            
            if (res.error) {
                throw new Error(res.msg);
            }

            localStorage.setItem("token", res.token);
            const userData = {
                name: res.user?.name,
                email: res.user?.email,
                userId: res.user?.id,
            };
            localStorage.setItem("user", JSON.stringify(userData));
            context.setUser(userData);

            context.setAlertBox({
                open: true,
                error: false,
                msg: "Google login successful"
            });

            navigate("/");
            context.setIsLogin(true);
            context.setisHeaderFooterShow(true);
        } catch (error) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: error.message || "Google login failed"
            });
        }
    };

    return (
        <section className="section signInPage">
            <div className="container">
                <div className="box card p-3 shadow border-0">
                    <div className="text-center">
                        <img 
                            src={Logo} 
                            alt="Company Logo" 
                            className="auth-logo"
                        />
                    </div>

                    <form onSubmit={handleLogin} className="mt-3">
                        <h1 className="mb-4">Sign In</h1>

                        <div className="form-group mb-3">
                            <TextField
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formFields.email}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                variant="outlined"
                                inputProps={{
                                    'aria-label': 'Email address',
                                    autoComplete: 'email'
                                }}
                            />
                        </div>

                        <div className="form-group mb-3">
                            <TextField
                                label="Password"
                                type="password"
                                name="password"
                                value={formFields.password}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                variant="outlined"
                                inputProps={{
                                    'aria-label': 'Password',
                                    autoComplete: 'current-password'
                                }}
                            />
                        </div>

                        <div className="d-flex justify-content-between mb-3">
                            <Link 
                                to="/forgot-password" 
                                className="text-decoration-none"
                                aria-label="Forgot password?"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <div className="d-grid gap-2 mb-3">
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large"
                                disabled={isLoading}
                                aria-label="Sign in"
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </div>

                        <div className="text-center mb-3">
                            <span className="d-inline-block mx-2">or</span>
                        </div>

                        <div className="d-grid gap-2">
                            <Button
                                variant="outlined"
                                onClick={handleGoogleSignIn}
                                startIcon={
                                    <img 
                                        src={GoogleImg} 
                                        alt="Google logo" 
                                        width="20"
                                        height="20"
                                    />
                                }
                                aria-label="Sign in with Google"
                            >
                                Sign In with Google
                            </Button>
                        </div>

                        <div className="text-center mt-3">
                            <span>Don't have an account? </span>
                            <Link 
                                to="/signUp" 
                                className="text-decoration-none"
                                aria-label="Sign up"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

SignIn.propTypes = {
    onSuccess: PropTypes.func
};

export default SignIn;