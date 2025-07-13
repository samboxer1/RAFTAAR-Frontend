import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CircularProgress,
  Rating,
  Tooltip
} from '@mui/material';
import { BsCartFill } from 'react-icons/bs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdOutlineCompareArrows } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import ProductZoom from "../../Components/ProductZoom";
import QuantityBox from "../../Components/QuantityBox";
import RelatedProducts from "./RelatedProducts";
import { fetchDataFromApi, postData } from "../../utils/api";
import { MyContext } from "../../App";

const ProductDetails = () => {
  const [activeSize, setActiveSize] = useState(null);
  const [activeTabs, setActiveTabs] = useState(0);
  const [productData, setProductData] = useState(null);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [isAddedToMyList, setIsAddedToMyList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabError, setTabError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState({
    review: "",
    customerRating: 1
  });

  const { id } = useParams();
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setEnableFilterTab(false);
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const product = await fetchDataFromApi(`/api/products/${id}`);
      setProductData(product);

      // Set default active size if no variants
      if (!product?.productRam?.length && 
          !product?.productWeight?.length && 
          !product?.size?.length) {
        setActiveSize(1);
      }

      // Fetch related products
      const related = await fetchDataFromApi(
        `/api/products/subCatId?subCatId=${product?.subCatId}&location=${localStorage.getItem("location")}`
      );
      setRelatedProductData(related?.products?.filter(item => item.id !== id));

      // Fetch reviews
      const reviews = await fetchDataFromApi(`/api/productReviews?productId=${id}`);
      setReviewsData(reviews);

      // Check if in wishlist
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.userId) {
        const wishlist = await fetchDataFromApi(
          `/api/my-list?productId=${id}&userId=${user.userId}`
        );
        setIsAddedToMyList(wishlist.length > 0);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviews(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newValue) => {
    setRating(newValue);
    setReviews(prev => ({ ...prev, customerRating: newValue }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please login first"
      });
      return;
    }

    if (!reviews.review.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please add a review"
      });
      return;
    }

    try {
      setIsLoading(true);
      const reviewData = {
        ...reviews,
        productId: id,
        customerName: user.name,
        customerId: user.userId
      };

      await postData("/api/productReviews/add", reviewData);
      
      // Refresh reviews
      const updatedReviews = await fetchDataFromApi(`/api/productReviews?productId=${id}`);
      setReviewsData(updatedReviews);
      
      // Reset form
      setReviews({ review: "", customerRating: 1 });
      setRating(1);
      
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = () => {
    if (activeSize === null && 
        (productData?.productRam?.length || 
         productData?.productWeight?.length || 
         productData?.size?.length)) {
      setTabError(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please login to add to cart"
      });
      return;
    }

    const cartItem = {
      productTitle: productData.name,
      image: productData.images[0],
      rating: productData.rating,
      price: productData.price,
      quantity: quantity,
      subTotal: productData.price * quantity,
      productId: productData.id,
      countInStock: productData.countInStock,
      userId: user.userId
    };

    context.addToCart(cartItem);
  };

  const toggleWishlist = async () => {
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
        productTitle: productData.name,
        image: productData.images[0],
        rating: productData.rating,
        price: productData.price,
        productId: id,
        userId: user.userId
      };

      const response = await postData("/api/my-list/add", wishlistItem);
      
      if (response.status !== false) {
        setIsAddedToMyList(!isAddedToMyList);
        context.setAlertBox({
          open: true,
          error: false,
          msg: isAddedToMyList 
            ? "Removed from wishlist" 
            : "Added to wishlist"
        });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: response.msg
        });
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const scrollToReviews = () => {
    window.scrollTo({
      top: 550,
      behavior: "smooth"
    });
    setActiveTabs(2);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!productData) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <section className="productDetails section">
      <div className="container">
        <div className="row">
          <div className="col-md-4 pl-5 part1">
            <ProductZoom 
              images={productData.images} 
              discount={productData.discount} 
            />
          </div>

          <div className="col-md-7 pl-5 pr-5 part2">
            <h2 className="hd text-capitalize">{productData.name}</h2>
            
            <div className="d-flex align-items-center mb-3">
              <span className="text-light mr-2">Brand:</span>
              <span>{productData.brand}</span>
              
              <div className="d-flex align-items-center ml-4">
                <Rating
                  name="product-rating"
                  value={Number(productData.rating)}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <span 
                  className="text-light cursor ml-2"
                  onClick={scrollToReviews}
                >
                  {reviewsData.length} Review{reviewsData.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="d-flex info mb-3">
              {productData.oldPrice && (
                <span className="oldPrice">{formatPrice(productData.oldPrice)}</span>
              )}
              <span className="netPrice text-danger ml-2">
                {formatPrice(productData.price)}
              </span>
            </div>

            <span className={`badge ${
              productData.countInStock >= 1 ? 'badge-success' : 'badge-danger'
            }`}>
              {productData.countInStock >= 1 ? 'IN STOCK' : 'OUT OF STOCK'}
            </span>

            <p className="mt-3">{productData.description}</p>

            {['productRam', 'size', 'productWeight'].map((variant) => (
              productData[variant]?.length > 0 && (
                <div key={variant} className="productSize d-flex align-items-center mt-2">
                  <span>{variant.replace('product', '').replace(/([A-Z])/g, ' $1')}:</span>
                  <ul className={`list list-inline mb-0 pl-4 ${tabError && 'error'}`}>
                    {productData[variant].map((item, index) => (
                      <li key={`${variant}-${index}`} className="list-inline-item">
                        <button
                          type="button"
                          className={`tag ${activeSize === index ? 'active' : ''}`}
                          onClick={() => {
                            isActive(index);
                            setTabError(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}

            <div className="d-flex align-items-center mt-3 actions_">
              <QuantityBox
                quantity={setQuantity}
                item={productData}
              />

              <div className="d-flex align-items-center btnActions">
                <Button
                  className="btn-blue btn-lg btn-big btn-round bg-red"
                  onClick={addToCart}
                  disabled={context.addingInCart}
                  startIcon={<BsCartFill />}
                >
                  {context.addingInCart ? "Adding..." : "Add to cart"}
                </Button>

                <Tooltip
                  title={isAddedToMyList ? "Remove from wishlist" : "Add to wishlist"}
                  placement="top"
                >
                  <Button
                    className="btn-blue btn-lg btn-big btn-circle ml-4"
                    onClick={toggleWishlist}
                  >
                    {isAddedToMyList ? (
                      <FaHeart className="text-danger" />
                    ) : (
                      <FaRegHeart />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip title="Add to compare" placement="top">
                  <Button className="btn-blue btn-lg btn-big btn-circle ml-2">
                    <MdOutlineCompareArrows />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-5 p-5 detailsPageTabs">
          <div className="customTabs">
            <ul className="list list-inline">
              {['Description', 'Additional info', `Reviews (${reviewsData.length})`].map((tab, index) => (
                <li key={tab} className="list-inline-item">
                  <Button
                    className={activeTabs === index ? 'active' : ''}
                    onClick={() => setActiveTabs(index)}
                  >
                    {tab}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="tabContent mt-4">
              {activeTabs === 0 && (
                <div>{productData.description}</div>
              )}

              {activeTabs === 1 && (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                      {[
                        ['Stand Up', '35″L x 24″W x 37-45″H(front to back wheel)'],
                        ['Folded (w/o wheels)', '32.5″L x 18.5″W x 16.5″H'],
                        ['Color', 'Black, Blue, Red, White'],
                        ['Size', 'M, S']
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <th>{label}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTabs === 2 && (
                <div className="row">
                  <div className="col-md-8">
                    <h3>Customer questions & answers</h3>
                    
                    {reviewsData.length > 0 ? (
                      [...reviewsData].reverse().map((review) => (
                        <div key={review._id} className="reviewBox mb-4 border-bottom">
                          <div className="info">
                            <div className="d-flex align-items-center w-100">
                              <h5>{review.customerName}</h5>
                              <div className="ml-auto">
                                <Rating
                                  name={`rating-${review._id}`}
                                  value={review.customerRating}
                                  readOnly
                                  size="small"
                                />
                              </div>
                            </div>
                            <h6 className="text-light">
                              {new Date(review.dateCreated).toLocaleDateString()}
                            </h6>
                            <p>{review.review}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No reviews yet</p>
                    )}

                    <form className="reviewForm mt-5" onSubmit={submitReview}>
                      <h4>Add a review</h4>
                      <div className="form-group">
                        <textarea
                          className="form-control shadow"
                          placeholder="Write a Review"
                          name="review"
                          value={reviews.review}
                          onChange={handleReviewChange}
                          rows={4}
                          required
                        />
                      </div>

                      <div className="d-flex align-items-center mt-3">
                        <Rating
                          name="review-rating"
                          value={rating}
                          precision={0.5}
                          onChange={(_, newValue) => handleRatingChange(newValue)}
                        />
                      </div>

                      <div className="form-group mt-4">
                        <Button
                          type="submit"
                          className="btn-blue btn-lg btn-big btn-round"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Submit Review"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProductData.length > 0 && (
          <RelatedProducts
            title="RELATED PRODUCTS"
            data={relatedProductData}
          />
        )}
      </div>
    </section>
  );
};

export default ProductDetails;