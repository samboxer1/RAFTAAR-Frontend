import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Rating
} from '@mui/material';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Link, useParams } from 'react-router-dom';
import { IoMdCloseCircle } from "react-icons/io";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';

const Sidebar = ({ 
  isOpenFilter: propIsOpenFilter, 
  filterData, 
  filterByPrice, 
  filterByRating: propFilterByRating 
}) => {
  const [value, setValue] = useState([100, 100000]);
  const [filterSubCat, setFilterSubCat] = useState('');
  const [subCatId, setSubCatId] = useState('');
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const context = useContext(MyContext);
  const { id } = useParams();

  useEffect(() => {
    setSubCatId(id);
    fetchDataFromApi("/api/homeSideBanners").then((res) => {
      setHomeSideBanners(res);
    });
  }, [id]);

  useEffect(() => {
    filterByPrice(value, subCatId);
  }, [value, subCatId, filterByPrice]);

  const handleChange = (event) => {
    setFilterSubCat(event.target.value);
    filterData(event.target.value);
    setSubCatId(event.target.value);
  };

  const handleRatingFilter = (rating) => {
    propFilterByRating(rating, subCatId);
  };

  const handleCloseFilters = () => {
    context?.setIsOpenFilters(!context?.isOpenFilters);
  };

  return (
    <div className={`sidebar ${propIsOpenFilter ? 'open' : ''}`}>
      {context.windowWidth < 992 && (
        <>
          <div className='info d-flex align-items-center'>
            <h5>Filter Products</h5>
            <button 
              type="button"
              className='ml-auto closeFilters' 
              onClick={handleCloseFilters}
              aria-label="Close filters"
            >
              <IoMdCloseCircle />
            </button>
          </div>
          <hr />
        </>
      )}

      <div className="filterBox">
        <h6>PRODUCT CATEGORIES</h6>
        <div className='scroll'>
          <RadioGroup
            aria-labelledby="product-categories-radio-group"
            name="product-categories-radio-group"
            value={filterSubCat}
            onChange={handleChange}
          >
            {context?.subCategoryData?.length > 0 && context.subCategoryData.map((item) => (
              <FormControlLabel 
                key={item.id}
                value={item.id} 
                control={<Radio />} 
                label={item.name} 
              />
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="filterBox">
        <h6>FILTER BY PRICE</h6>
        <RangeSlider 
          value={value} 
          onInput={setValue} 
          min={100} 
          max={60000} 
          step={5} 
        />
        <div className='d-flex pt-2 pb-2 priceRange'>
          <span>From: <strong className='text-dark'>Rs: {value[0]}</strong></span>
          <span className='ml-auto'>To: <strong className='text-dark'>Rs: {value[1]}</strong></span>
        </div>
      </div>

      <div className="filterBox">
        <h6>FILTER BY RATING</h6>
        <div className='scroll pl-0'>
          <ul>
            {[5, 4, 3, 2, 1].map((rating) => (
              <li 
                key={rating}
                onClick={() => handleRatingFilter(rating)} 
                className='cursor'
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRatingFilter(rating)}
                aria-label={`Filter by ${rating} star rating`}
              >
                <Rating 
                  name={`rating-${rating}-stars`} 
                  value={rating} 
                  readOnly 
                  size="small" 
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {homeSideBanners?.length > 0 && homeSideBanners.map((item, index) => (
        <div className="banner mb-3" key={item.id || index}>
          <Link
            to={item.subCatId 
              ? `/products/subCat/${item.subCatId}`
              : `/products/category/${item.catId}`}
            className="box"
          >
            <img
              src={item.images[0]}
              className="w-100 transition"
              alt={item.altText || "Promotional banner"}
              loading="lazy"
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

Sidebar.propTypes = {
  isOpenFilter: PropTypes.bool,
  filterData: PropTypes.func.isRequired,
  filterByPrice: PropTypes.func.isRequired,
  filterByRating: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
  isOpenFilter: false
};

export default Sidebar;