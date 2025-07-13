import { Link, useNavigate } from "react-router-dom";
import Rating from '@mui/material/Rating';
import { IoIosClose } from "react-icons/io";
import Button from '@mui/material/Button';
import { IoBagCheckOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { MyContext } from "../../App";
import { useContext, useEffect, useState } from "react";
import { deleteData, fetchDataFromApi } from "../../utils/api";
import PropTypes from 'prop-types';

const MyList = () => {
    const [myListData, setMyListData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
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
        fetchMyListData();
    }, [context, navigate]);

    const fetchMyListData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?.userId) return;
            
            const data = await fetchDataFromApi(`/api/my-list?userId=${user.userId}`);
            setMyListData(data);
        } catch (error) {
            console.error("Error fetching my list data:", error);
        }
    };

    const removeItem = async (id) => {
        if (!id) return;
        
        setIsLoading(true);
        try {
            await deleteData(`/api/my-list/${id}`);
            context.setAlertBox({
                open: true,
                error: false,
                msg: "Item removed from My List!"
            });
            await fetchMyListData();
        } catch (error) {
            console.error("Error removing item:", error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Failed to remove item"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (!isLogin) {
        return null; // or loading spinner
    }

    return (
        <section className="section cartPage">
            <div className="container">
                <div className="myListTableWrapper">
                    <h2 className="hd mb-1">My List</h2>
                    <p>
                        There are <b className="text-red">{myListData.length}</b> products in your My List
                    </p>

                    {myListData.length > 0 ? (
                        <div className="row">
                            <div className="col-md-12 pr-5">
                                <div className="table-responsive myListTable">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th width="50%">Product</th>
                                                <th width="15%">Unit Price</th>
                                                <th width="10%">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myListData.map((item) => (
                                                <tr key={`my-list-item-${item._id}`}>
                                                    <td width="50%">
                                                        <Link to={`/product/${item.productId}`}>
                                                            <div className="d-flex align-items-center cartItemimgWrapper">
                                                                <div className="imgWrapper">
                                                                    <img 
                                                                        src={item.image} 
                                                                        className="w-100" 
                                                                        alt={item.productTitle} 
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                                <div className="info px-3">
                                                                    <h6>{item.productTitle}</h6>
                                                                    <Rating 
                                                                        name={`rating-${item._id}`} 
                                                                        value={item.rating} 
                                                                        readOnly 
                                                                        size="small" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td width="15%">{formatPrice(item.price)}</td>
                                                    <td width="10%">
                                                        <button
                                                            type="button"
                                                            className="remove"
                                                            onClick={() => removeItem(item._id)}
                                                            aria-label={`Remove ${item.productTitle}`}
                                                            disabled={isLoading}
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
                        </div>
                    ) : (
                        <div className="empty d-flex align-items-center justify-content-center flex-column">
                            <img 
                                src={require('../../assets/images/myList.png')} 
                                width="150" 
                                alt="Empty my list" 
                                loading="lazy"
                            />
                            <h3>My List is currently empty</h3>
                            <br />
                            <Link to="/">
                                <Button 
                                    className="btn-blue bg-red btn-lg btn-big btn-round"
                                    startIcon={<FaHome />}
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="loadingOverlay" aria-busy="true">
                    <div className="spinner"></div>
                </div>
            )}
        </section>
    );
};

MyList.propTypes = {
    // Add prop types if this component receives any props
};

export default MyList;