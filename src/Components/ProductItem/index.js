import React from 'react';
import PropTypes from 'prop-types';
import Rating from "@mui/material/Rating";
import { TfiFullscreen } from "react-icons/tfi";
import Button from "@mui/material/Button";
import { IoMdHeartEmpty } from "react-icons/io";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { IoIosImages } from "react-icons/io";
import { fetchDataFromApi, postData } from "../../utils/api";
import { FaHeart } from "react-icons/fa";

const ProductItem = ({ item, itemView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddedToMyList, setIsAddedToMyList] = useState(false);

  const context = useContext(MyContext);
  const sliderRef = useRef();

  const viewProductDetails = (id) => {
    context.openProductDetailsModal(id, true);
  };

  const handleMouseEnter = (id) => {
    if (!isLoading) {
      setIsHovered(true);
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickPlay();
        }
      }, 20);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userId) {
      fetchDataFromApi(`/api/my-list?productId=${id}&userId=${user.userId}`)
        .then((res) => {
          if (res.length !== 0) {
            setIsAddedToMyList(true);
          }
        });
    }
  };

  const handleMouseLeave = () => {
    if (!isLoading) {
      setIsHovered(false);
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickPause();
        }
      }, 20);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addToMyList = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please Login to continue",
      });
      return;
    }

    const data = {
      productTitle: item?.name,
      image: item?.images?.[0],
      rating: item?.rating,
      price: item?.price,
      productId: id,
      userId: user.userId,
    };

    postData(`/api/my-list/add/`, data).then((res) => {
      if (res.status !== false) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "The product was added to your list",
        });

        fetchDataFromApi(`/api/my-list?productId=${id}&userId=${user.userId}`)
          .then((res) => {
            if (res.length !== 0) {
              setIsAddedToMyList(true);
            }
          });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg,
        });
      }
    });
  };

  return (
    <div
      className={`productItem ${itemView}`}
      onMouseEnter={() =>
        handleMouseEnter(itemView === "recentlyView" ? item?.prodId : item?.id)
      }
      onMouseLeave={handleMouseLeave}
    >
      <div className="img_rapper">
        <Link
          to={`/product/${
            itemView === "recentlyView" ? item?.prodId : item?.id
          }`}
          aria-label={`View ${item?.name} details`}
        >
          <div className="productItemSliderWrapper">
            {isLoading ? (
              <Skeleton variant="rectangular" width={300} height={400}>
                <IoIosImages />
              </Skeleton>
            ) : (
              <>
                <img 
                  src={item?.images?.[0]} 
                  className="w-100 img1" 
                  alt={item?.name || 'Product image'} 
                />
                {item?.images?.length > 1 && (
                  <img 
                    src={item?.images?.[1]} 
                    className="w-100 img2" 
                    alt={item?.name || 'Product secondary image'} 
                  />
                )}
              </>
            )}
          </div>
        </Link>

        {item?.discount && (
          <span className="badge badge-primary">{item.discount}%</span>
        )}

        <div className="actions">
          <Button
            onClick={() =>
              viewProductDetails(
                itemView === "recentlyView" ? item?.prodId : item?.id
              )
            }
            aria-label="Quick view"
          >
            <TfiFullscreen />
          </Button>

          <Button
            className={isAddedToMyList ? "active" : ""}
            onClick={() =>
              addToMyList(
                itemView === "recentlyView" ? item?.prodId : item?.id
              )
            }
            aria-label={isAddedToMyList ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isAddedToMyList ? (
              <FaHeart style={{ fontSize: "20px" }} />
            ) : (
              <IoMdHeartEmpty style={{ fontSize: "20px" }} />
            )}
          </Button>
        </div>
      </div>

      <div className="info" title={item?.name}>
        <Link
          to={`/product/${
            itemView === "recentlyView" ? item?.prodId : item?.id
          }`}
        >
          <h4>{item?.name?.substr(0, 20) + "..."}</h4>
        </Link>

        {item?.countInStock >= 1 ? (
          <span className="text-success d-block">In Stock</span>
        ) : (
          <span className="text-danger d-block">Out of Stock</span>
        )}

        <Rating
          className="mt-2 mb-2"
          name="read-only"
          value={item?.rating}
          readOnly
          size="small"
          precision={0.5}
        />

        <div className="d-flex">
          {item?.oldPrice && (
            <span className="oldPrice">Rs {item.oldPrice}</span>
          )}
          <span className="netPrice text-danger ml-2">
            Rs {item?.price}
          </span>
        </div>
      </div>
    </div>
  );
};

ProductItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    prodId: PropTypes.string,
    name: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    price: PropTypes.number,
    oldPrice: PropTypes.number,
    discount: PropTypes.number,
    countInStock: PropTypes.number
  }).isRequired,
  itemView: PropTypes.string
};

ProductItem.defaultProps = {
  itemView: ''
};

export default ProductItem;