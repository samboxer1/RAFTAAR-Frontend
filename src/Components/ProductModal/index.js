import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";
import { MyContext } from '../../App';
import ProductZoom from '../ProductZoom';
import { IoCartSharp } from "react-icons/io5";
import { fetchDataFromApi, postData } from '../../utils/api';
import PropTypes from 'prop-types';

const ProductModal = ({ data }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeSize, setActiveSize] = useState(null);
    const [sizeError, setSizeError] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        if (data?.productRam?.length === 0 && 
            data?.productWeight?.length === 0 && 
            data?.size?.length === 0) {
            setActiveSize(0);
        }

        const checkWishlist = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (user?.userId) {
                    const res = await fetchDataFromApi(
                        `/api/my-list?productId=${data?.id}&userId=${user.userId}`
                    );
                    setIsInWishlist(res.length > 0);
                }
            } catch (error) {
                console.error("Wishlist check failed:", error);
            }
        };

        checkWishlist();
    }, [data]);

    const handleSizeSelect = (index) => {
        setActiveSize(index);
        setSizeError(false);
    };

    const handleAddToCart = () => {
        if (activeSize === null && 
            (data?.productRam?.length > 0 || 
             data?.size?.length > 0 || 
             data?.productWeight?.length > 0)) {
            setSizeError(true);
            return;
        }

        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        
        const cartItem = {
            productTitle: data?.name,
            image: data?.images[0],
            rating: data?.rating,
            price: data?.price,
            quantity: quantity,
            subTotal: data?.price * quantity,
            productId: data?.id,
            countInStock: data?.countInStock,
            userId: user?.userId
        };

        context.addToCart(cartItem);
        setIsLoading(false);
    };

    const handleWishlist = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please login to use wishlist"
            });
            return;
        }

        try {
            const wishlistItem = {
                productTitle: data?.name,
                image: data?.images[0],
                rating: data?.rating,
                price: data?.price,
                productId: data?.id,
                userId: user.userId
            };

            const res = await postData('/api/my-list/add/', wishlistItem);
            context.setAlertBox({
                open: true,
                error: res.error || false,
                msg: res.msg || (res.error ? "Operation failed" : "Added to wishlist")
            });
            setIsInWishlist(!res.error);
        } catch (error) {
            console.error("Wishlist operation failed:", error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Operation failed"
            });
        }
    };

    const renderSizeOptions = (items, label) => (
        <div className='productSize d-flex align-items-center'>
            <span>{label}:</span>
            <ul className={`list list-inline mb-0 pl-4 ${sizeError && 'error'}`}>
                {items?.map((item, index) => (
                    <li className='list-inline-item' key={`${label}-${index}`}>
                        <button
                            className={`tag ${activeSize === index ? 'active' : ''}`}
                            onClick={() => handleSizeSelect(index)}
                            aria-label={`Select ${item}`}
                        >
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <Dialog 
            open={context.isOpenProductModal} 
            onClose={() => context.setisOpenProductModal(false)}
            aria-labelledby="product-dialog-title"
        >
            <Button 
                className='close_' 
                onClick={() => context.setisOpenProductModal(false)}
                aria-label="Close product dialog"
            >
                <MdClose />
            </Button>
            
            <h4 id="product-dialog-title" className="mb-1 font-weight-bold pr-5">
                {data?.name}
            </h4>
            
            <div className='d-flex align-items-center'>
                <div className='d-flex align-items-center mr-4'>
                    <span>Brand:</span>
                    <span className='ml-2'><b>{data?.brand}</b></span>
                </div>
                <Rating 
                    name="product-rating" 
                    value={parseFloat(data?.rating)} 
                    precision={0.5} 
                    readOnly 
                    aria-label={`Rating: ${data?.rating} stars`}
                />
            </div>

            <hr />

            <div className='row mt-2 productDetaileModal'>
                <div className='col-md-5'>
                    <ProductZoom images={data?.images} discount={data?.discount} />
                </div>

                <div className='col-md-7'>
                    <div className='d-flex info align-items-center mb-3'>
                        {data?.oldPrice && (
                            <span className='oldPrice lg mr-2'>Rs: {data?.oldPrice}</span>
                        )}
                        <span className='netPrice text-danger lg'>Rs: {data?.price}</span>
                    </div>

                    <span className="badge bg-success">IN STOCK</span>
                    <p className='mt-3'>{data?.description}</p>

                    {data?.productRam?.length > 0 && renderSizeOptions(data.productRam, "RAM")}
                    {data?.size?.length > 0 && renderSizeOptions(data.size, "Size")}
                    {data?.productWeight?.length > 0 && renderSizeOptions(data.productWeight, "Weight")}

                    <div className='d-flex align-items-center actions_'>
                        <QuantityBox 
                            quantity={setQuantity} 
                            item={data} 
                            value={quantity}
                        />

                        <Button 
                            className='btn-blue bg-red btn-lg btn-big btn-round ml-3' 
                            onClick={handleAddToCart}
                            disabled={context.addingInCart || isLoading}
                            aria-label="Add to cart"
                        >
                            {context.addingInCart || isLoading ? (
                                "Adding..."
                            ) : (
                                <>
                                    <IoCartSharp aria-hidden="true" />
                                    <span> Add to cart</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className='d-flex align-items-center mt-5 actions'>
                        <Button 
                            className='btn-round btn-sml' 
                            variant="outlined" 
                            onClick={handleWishlist}
                            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            {isInWishlist ? (
                                <>
                                    <FaHeart className="text-danger" aria-hidden="true" />
                                    <span> IN WISHLIST</span>
                                </>
                            ) : (
                                <>
                                    <FaRegHeart aria-hidden="true" />
                                    <span> ADD TO WISHLIST</span>
                                </>
                            )}
                        </Button>
                        
                        <Button 
                            className='btn-round btn-sml ml-3' 
                            variant="outlined"
                            aria-label="Compare product"
                        >
                            <MdOutlineCompareArrows aria-hidden="true" />
                            <span> COMPARE</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

ProductModal.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        brand: PropTypes.string,
        rating: PropTypes.number,
        images: PropTypes.array,
        oldPrice: PropTypes.number,
        price: PropTypes.number,
        description: PropTypes.string,
        productRam: PropTypes.array,
        size: PropTypes.array,
        productWeight: PropTypes.array,
        countInStock: PropTypes.number,
        discount: PropTypes.number
    }).isRequired
};

export default ProductModal;