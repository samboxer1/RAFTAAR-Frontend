import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import Rating from '@mui/material/Rating';
import QuantityBox from "../../Components/QuantityBox";
import { IoIosClose } from "react-icons/io";
import Button from '@mui/material/Button';
import { IoBagCheckOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import emprtCart from '../../assets/images/emptyCart.png';

const Cart = () => {
    const [cartData, setCartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setEnableFilterTab(false);
        
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signIn");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        const fetchCartData = async () => {
            try {
                const res = await fetchDataFromApi(`/api/cart?userId=${user?.userId}`);
                setCartData(res);
            } catch (error) {
                console.error("Failed to fetch cart data:", error);
            }
        };
        fetchCartData();
    }, [context, navigate]);

    const handleQuantityChange = (quantityVal, item) => {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        
        const updatedFields = {
            productTitle: item?.productTitle,
            image: item?.image,
            rating: item?.rating,
            price: item?.price,
            quantity: quantityVal,
            subTotal: parseInt(item?.price * quantityVal),
            productId: item?.id,
            userId: user?.userId
        };

        editData(`/api/cart/${item?._id}`, updatedFields)
            .then(() => {
                setTimeout(() => {
                    fetchDataFromApi(`/api/cart?userId=${user?.userId}`)
                        .then((res) => {
                            setCartData(res);
                            context.getCartData();
                            setIsLoading(false);
                        });
                }, 1000);
            })
            .catch(error => {
                console.error("Error updating cart:", error);
                setIsLoading(false);
            });
    };

    const removeItem = (id) => {
        setIsLoading(true);
        deleteData(`/api/cart/${id}`)
            .then(() => {
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: "Item removed from cart!"
                });
                
                const user = JSON.parse(localStorage.getItem("user"));
                return fetchDataFromApi(`/api/cart?userId=${user?.userId}`);
            })
            .then((res) => {
                setCartData(res);
                context.getCartData();
            })
            .catch(error => {
                console.error("Error removing item:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const calculateTotal = () => {
        if (!context.cartData?.length) return 0;
        return context.cartData.reduce(
            (total, item) => total + (parseInt(item.price) * item.quantity), 
            0
        );
    };

    return (
        <section className="section cartPage">
            <div className="container">
                <h1 className="hd mb-1">Your Cart</h1>
                <p>There are <b className="text-red">{cartData?.length || 0}</b> products in your cart</p>

                {cartData?.length ? (
                    <div className="row">
                        <div className="col-md-9 pr-5">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th width="35%">Product</th>
                                            <th width="15%">Unit Price</th>
                                            <th width="25%">Quantity</th>
                                            <th width="15%">Subtotal</th>
                                            <th width="10%">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartData.map((item) => (
                                            <tr key={item._id}>
                                                <td width="35%">
                                                    <Link to={`/product/${item.productId}`}>
                                                        <div className="d-flex align-items-center cartItemimgWrapper">
                                                            <div className="imgWrapper">
                                                                <img 
                                                                    src={item.image}
                                                                    className="w-100" 
                                                                    alt={item.productTitle}
                                                                    width="80"
                                                                    height="80"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                            <div className="info px-3">
                                                                <h6>
                                                                    {item.productTitle?.length > 30 
                                                                        ? `${item.productTitle.substring(0, 30)}...`
                                                                        : item.productTitle}
                                                                </h6>
                                                                <Rating 
                                                                    name="read-only" 
                                                                    value={item.rating} 
                                                                    readOnly 
                                                                    size="small" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td width="15%">₹{item.price}</td>
                                                <td width="25%">
                                                    <QuantityBox 
                                                        quantity={(val) => handleQuantityChange(val, item)} 
                                                        item={item} 
                                                        value={item.quantity} 
                                                    />
                                                </td>
                                                <td width="15%">₹{item.subTotal}</td>
                                                <td width="10%">
                                                    <button 
                                                        className="remove btn-unstyled" 
                                                        onClick={() => removeItem(item._id)}
                                                        aria-label={`Remove ${item.productTitle} from cart`}
                                                    >
                                                        <IoIosClose />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border p-3 cartDetails">
                                <h2>CART TOTALS</h2>
                                <div className="d-flex align-items-center mb-3">
                                    <span>Subtotal</span>
                                    <span className="ml-auto text-red font-weight-bold">
                                        {calculateTotal().toLocaleString('en-IN', { 
                                            style: 'currency', 
                                            currency: 'INR' 
                                        })}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <span>Shipping</span>
                                    <span className="ml-auto"><b>Free</b></span>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <span>Estimate for</span>
                                    <span className="ml-auto"><b>India</b></span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span>Total</span>
                                    <span className="ml-auto text-red font-weight-bold">
                                        {calculateTotal().toLocaleString('en-IN', { 
                                            style: 'currency', 
                                            currency: 'INR' 
                                        })}
                                    </span>
                                </div>
                                <br />
                                <Link to="/checkout">
                                    <Button className='btn-blue bg-red btn-lg btn-big'>
                                        <IoBagCheckOutline /> &nbsp; Checkout
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty d-flex align-items-center justify-content-center flex-column">
                        <img 
                            src={emprtCart} 
                            alt="Empty shopping cart" 
                            width="150" 
                            height="150"
                            loading="lazy"
                        />
                        <h2>Your Cart is currently empty</h2>
                        <br />
                        <Link to="/">
                            <Button className='btn-blue bg-red btn-lg btn-big btn-round'>
                                <FaHome /> &nbsp; Continue Shopping
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="loadingOverlay" aria-busy="true">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
        </section>
    );
};

export default Cart;