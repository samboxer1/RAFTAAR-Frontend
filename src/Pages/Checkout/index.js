import React, { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoBagCheckOutline } from "react-icons/io5";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const initialFormState = {
  fullName: "",
  country: "",
  streetAddressLine1: "",
  streetAddressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  phoneNumber: "",
  email: "",
};

const Checkout = () => {
  const [formFields, setFormFields] = useState(initialFormState);
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setEnableFilterTab(false);
    
    const fetchCartData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.userId) return;
        
        const res = await fetchDataFromApi(`/api/cart?userId=${user.userId}`);
        setCartData(res);
        
        const calculatedTotal = res?.reduce(
          (total, item) => total + (parseInt(item.price) * item.quantity),
          0
        );
        setTotalAmount(calculatedTotal || 0);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchCartData();
  }, [context]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "fullName", message: "Please fill full name" },
      { field: "country", message: "Please fill country" },
      { field: "streetAddressLine1", message: "Please fill street address" },
      { field: "city", message: "Please fill city" },
      { field: "state", message: "Please fill state" },
      { field: "zipCode", message: "Please fill zip code" },
      { field: "phoneNumber", message: "Please fill phone number" },
      { field: "email", message: "Please fill email" },
    ];

    for (const { field, message } of requiredFields) {
      if (!formFields[field].trim()) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: message,
        });
        return false;
      }
    }
    return true;
  };

  const processOrder = async (paymentResponse) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const addressInfo = {
        name: formFields.fullName,
        phoneNumber: formFields.phoneNumber,
        address: `${formFields.streetAddressLine1} ${formFields.streetAddressLine2}`,
        pincode: formFields.zipCode,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      const payload = {
        ...addressInfo,
        amount: totalAmount,
        paymentId: paymentResponse.razorpay_payment_id,
        email: user.email,
        userid: user.userId,
        products: cartData,
      };

      await postData("/api/orders/create", payload);
      
      // Clear cart after successful order
      await Promise.all(
        cartData.map(item => 
          deleteData(`/api/cart/${item.id}`).catch(console.error)
        )
      );
      
      context.getCartData();
      navigate("/orders");
    } catch (error) {
      console.error("Order processing error:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error processing your order. Please try again.",
      });
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cartData.length === 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Your cart is empty",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
        amount: totalAmount * 100,
        currency: "INR",
        name: "E-Bharat",
        description: "Order Payment",
        handler: processOrder,
        theme: { color: "#3399cc" },
      };

      const paymentInstance = new window.Razorpay(options);
      paymentInstance.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error initializing payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = (items) => {
    return items?.reduce(
      (total, item) => total + (parseInt(item.price) * item.quantity),
      0
    ) || 0;
  };

  return (
    <section className="section">
      <div className="container">
        <form className="checkoutForm" onSubmit={handleCheckout}>
          <div className="row">
            <div className="col-md-8">
              <h2 className="hd">BILLING DETAILS</h2>

              <div className="row mt-3">
                <div className="col-md-6">
                  <TextField
                    label="Full Name *"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="fullName"
                    value={formFields.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <TextField
                    label="Country *"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="country"
                    value={formFields.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h6>Street address *</h6>
              <TextField
                label="House number and street name"
                variant="outlined"
                className="w-100 mb-2"
                size="small"
                name="streetAddressLine1"
                value={formFields.streetAddressLine1}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Apartment, suite, unit, etc. (optional)"
                variant="outlined"
                className="w-100"
                size="small"
                name="streetAddressLine2"
                value={formFields.streetAddressLine2}
                onChange={handleInputChange}
              />

              <h6>Town / City *</h6>
              <TextField
                label="City"
                variant="outlined"
                className="w-100"
                size="small"
                name="city"
                value={formFields.city}
                onChange={handleInputChange}
                required
              />

              <h6>State / County *</h6>
              <TextField
                label="State"
                variant="outlined"
                className="w-100"
                size="small"
                name="state"
                value={formFields.state}
                onChange={handleInputChange}
                required
              />

              <h6>Postcode / ZIP *</h6>
              <TextField
                label="ZIP Code"
                variant="outlined"
                className="w-100"
                size="small"
                name="zipCode"
                value={formFields.zipCode}
                onChange={handleInputChange}
                required
              />

              <div className="row mt-3">
                <div className="col-md-6">
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="phoneNumber"
                    value={formFields.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <TextField
                    label="Email Address"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="email"
                    value={formFields.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card orderInfo">
                <h4 className="hd">YOUR ORDER</h4>
                <div className="table-responsive mt-3">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartData?.map((item, index) => (
                        <tr key={`product-${item.id || index}`}>
                          <td>
                            {`${item.productTitle?.substring(0, 20)}...`}
                            <b> × {item.quantity}</b>
                          </td>
                          <td>
                            {(item.price * item.quantity).toLocaleString("en-US", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>Subtotal</td>
                        <td>
                          {calculateSubtotal(cartData).toLocaleString("en-US", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button
                  type="submit"
                  className="btn-blue bg-red btn-lg btn-big"
                  disabled={isLoading || cartData.length === 0}
                  startIcon={<IoBagCheckOutline />}
                >
                  {isLoading ? "Processing..." : "Checkout"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkout;