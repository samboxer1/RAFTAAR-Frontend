import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchDataFromApi } from '../../utils/api';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
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

        setIsLogin(true);
        fetchOrders();
    }, [context, navigate]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?.userId) return;
            
            const data = await fetchDataFromApi(`/api/orders?userid=${user.userId}`);
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const showProducts = async (id) => {
        try {
            setIsLoading(true);
            const data = await fetchDataFromApi(`/api/orders/${id}`);
            setProducts(data.products);
            setIsOpenModal(true);
        } catch (error) {
            console.error("Error fetching order products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (!isLogin) {
        return null;
    }

    return (
        <section className="section">
            <div className='container'>
                <h2 className='hd'>Orders</h2>

                {isLoading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className='table-responsive orderTable'>
                        <table className='table table-striped table-bordered'>
                            <thead className='thead-light'>
                                <tr>
                                    <th>Order Id</th>
                                    <th>Payment Id</th>
                                    <th>Products</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={`order-${order.id}`}>
                                            <td>
                                                <span className='text-blue font-weight-bold'>
                                                    {order.id}
                                                </span>
                                            </td>
                                            <td>
                                                <span className='text-blue font-weight-bold'>
                                                    {order.paymentId || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="text" 
                                                    onClick={() => showProducts(order._id)}
                                                    aria-label={`View products for order ${order.id}`}
                                                >
                                                    View Products
                                                </Button>
                                            </td>
                                            <td>{order.name}</td>
                                            <td>{order.phoneNumber}</td>
                                            <td>{formatCurrency(order.amount)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    order.status === "pending" 
                                                        ? 'badge-danger' 
                                                        : 'badge-success'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(order.date)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="mt-4 d-flex justify-content-center">
                        <Pagination 
                            count={Math.ceil(orders.length / 10)} 
                            page={page} 
                            onChange={(_, value) => setPage(value)} 
                            color="primary" 
                        />
                    </div>
                )}
            </div>

            <Dialog 
                open={isOpenModal} 
                onClose={() => setIsOpenModal(false)}
                maxWidth="md"
                fullWidth
                aria-labelledby="order-products-dialog"
            >
                <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0 font-weight-bold">Order Products</h4>
                        <Button 
                            onClick={() => setIsOpenModal(false)}
                            startIcon={<MdClose />}
                            aria-label="Close dialog"
                        >
                            Close
                        </Button>
                    </div>

                    <div className='table-responsive'>
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Image</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((item) => (
                                        <tr key={`product-${item.productId}`}>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="font-weight-bold">{item.productId}</span>
                                                    <span>{item.productTitle}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <img 
                                                    src={item.image} 
                                                    alt={item.productTitle} 
                                                    className="img-thumbnail"
                                                    width="80"
                                                    loading="lazy"
                                                />
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.price)}</td>
                                            <td>{formatCurrency(item.subTotal)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Dialog>
        </section>
    );
};

export default Orders;