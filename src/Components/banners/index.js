import React, { useContext } from "react";
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./style.css";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";

const Banners = ({ data = [], col = 3 }) => {
  const context = useContext(MyContext);

  const renderBannerItem = (item) => {
    const linkTo = item?.subCatId 
      ? `/products/subCat/${item.subCatId}`
      : `/products/category/${item.catId}`;
    
    return (
      <Link to={linkTo} className="box">
        <img
          src={item.images[0]}
          className="w-100 transition"
          alt={item.altText || "Promotional banner"}
          loading="lazy"
        />
      </Link>
    );
  };

  return (
    <div className="bannerAds pt-3 pb-3">
      {context?.windowWidth > 992 ? (
        <Swiper
          slidesPerView={col}
          spaceBetween={10}
          loop={true}
          navigation={true}
          slidesPerGroup={1}
          modules={[Navigation]}
          className="bannerSection pt-3"
          breakpoints={{
            300: { slidesPerView: 1 },
            400: { slidesPerView: 2 },
            600: { slidesPerView: 3 },
            750: { slidesPerView: col },
          }}
        >
          {data?.length > 0 && data.map((item, index) => (
            <SwiperSlide key={`swiper-${item.id || index}`}>
              <div className="col_">
                {renderBannerItem(item)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div 
          className="bannerSection pt-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(col, data.length)}, 1fr)` }}
        >
          {data?.length > 0 && data.map((item, index) => (
            <div className="col_" key={`grid-${item.id || index}`}>
              {renderBannerItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Banners.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subCatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      catId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      images: PropTypes.arrayOf(PropTypes.string),
      altText: PropTypes.string
    })
  ),
  col: PropTypes.number
};

Banners.defaultProps = {
  data: [],
  col: 3
};

export default Banners;