import Sidebar from "../../Components/Sidebar";
import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { HiViewGrid } from "react-icons/hi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";
import Pagination from '@mui/material/Pagination';
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { FaFilter } from "react-icons/fa";
import { MyContext } from "../../App";

const SearchPage = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [productView, setProductView] = useState('four');
    const [productData, setProductData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const openDropdown = Boolean(anchorEl);
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const context = useContext(MyContext);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsLoading(true);
        setTimeout(() => {
            setProductData(context.searchData);
            setIsLoading(false);
        }, 3000);
        
        context.setEnableFilterTab(false);
    }, [context, context.searchData]);

    const filterData = (subCatId) => {
        setIsLoading(true);
        fetchDataFromApi(`/api/products?subCatId=${subCatId}`).then((res) => {
            setProductData(res.products);
            setIsLoading(false);
        });
    };

    const filterByPrice = (price, subCatId) => {
        setIsLoading(true);
        fetchDataFromApi(`/api/products?minPrice=${price[0]}&maxPrice=${price[1]}&subCatId=${subCatId}`)
            .then((res) => {
                setProductData(res.products);
                setIsLoading(false);
            });
    };

    const filterByRating = (rating, subCatId) => {
        setIsLoading(true);
        fetchDataFromApi(`/api/products?rating=${rating}&subCatId=${subCatId}`)
            .then((res) => {
                setProductData(res.products);
                setIsLoading(false);
            });
    };

    const openFilters = () => {
        setIsOpenFilter(!isOpenFilter);
    };

    return (
        <section className="product_Listing_Page">
            <div className="container">
                <div className="productListing d-flex">
                    <Sidebar 
                        filterData={filterData} 
                        filterByPrice={filterByPrice} 
                        filterByRating={filterByRating}  
                        isOpenFilter={isOpenFilter} 
                    />

                    <div className="content_right">
                        <div className="showBy mt-0 mb-3 d-flex align-items-center">
                            <div className="d-flex align-items-center btnWrapper">
                                <Button 
                                    className={productView === 'one' ? 'act' : ''} 
                                    onClick={() => setProductView('one')}
                                    aria-label="List view"
                                >
                                    <IoIosMenu />
                                </Button>

                                <Button 
                                    className={productView === 'three' ? 'act' : ''} 
                                    onClick={() => setProductView('three')}
                                    aria-label="Three column view"
                                >
                                    <CgMenuGridR />
                                </Button>
                                
                                <Button 
                                    className={productView === 'four' ? 'act' : ''} 
                                    onClick={() => setProductView('four')}
                                    aria-label="Four column view"
                                >
                                    <TfiLayoutGrid4Alt />
                                </Button>
                            </div>
                        </div>

                        <div className="productListing">
                            {isLoading ? (
                                <div className="loading d-flex align-items-center justify-content-center">
                                    <CircularProgress color="inherit" />
                                </div>
                            ) : (
                                productData?.length > 0 && productData.map((item) => (
                                    <ProductItem 
                                        key={item.id} 
                                        itemView={productView} 
                                        item={item} 
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchPage;