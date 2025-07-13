import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ProductZoom = ({ images = [], discount = 0 }) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const zoomSliderBig = useRef(null);
    const zoomSlider = useRef(null);

    const goto = (index) => {
        setSlideIndex(index);
        if (zoomSlider.current?.swiper) {
            zoomSlider.current.swiper.slideTo(index);
        }
        if (zoomSliderBig.current?.swiper) {
            zoomSliderBig.current.swiper.slideTo(index);
        }
    };

    return (
        <div className="productZoom">
            <div className='productZoom productZoomBig position-relative mb-3'>
                {discount > 0 && (
                    <div className='badge badge-primary'>{discount}% OFF</div>
                )}
                <Swiper
                    slidesPerView={1}
                    spaceBetween={0}
                    navigation={false}
                    slidesPerGroup={1}
                    modules={[Navigation]}
                    className="zoomSliderBig"
                    ref={zoomSliderBig}
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={`big-${index}`}>
                            <div className='item'>
                                <InnerImageZoom
                                    zoomType="hover"
                                    zoomScale={1}
                                    src={img}
                                    imgAttributes={{
                                        alt: `Product view ${index + 1}`,
                                        loading: 'lazy'
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <Swiper
                slidesPerView={Math.min(5, images.length)}
                spaceBetween={10}
                navigation={true}
                slidesPerGroup={1}
                modules={[Navigation]}
                className="zoomSlider"
                ref={zoomSlider}
            >
                {images.map((img, index) => (
                    <SwiperSlide key={`thumb-${index}`}>
                        <div 
                            className={`item ${slideIndex === index ? 'item_active' : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => goto(index)}
                            onKeyDown={(e) => e.key === 'Enter' && goto(index)}
                            aria-label={`View product image ${index + 1}`}
                        >
                            <img 
                                src={img} 
                                className='w-100' 
                                alt={`Product thumbnail ${index + 1}`}
                                loading="lazy"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

ProductZoom.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    discount: PropTypes.number
};

ProductZoom.defaultProps = {
    discount: 0
};

export default ProductZoom;