import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { MyContext } from "../../../App";
import CountryDropdown from "../../CountryDropdown";
import Logo from "../../../assets/images/logo.jpg";
import { RiLogoutCircleRFill } from "react-icons/ri";
import React from 'react'; // Add at the top

const Navigation = (props) => {
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [isOpenSubMenuIndex, setIsOpenSubMenuIndex] = useState(null);
  const [isOpenSubMenu_, setIsOpenSubMenu_] = useState(false);

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    setIsOpenNav(props.isOpenNav);
  }, [props.isOpenNav]);

  const IsOpenSubMenu = (index) => {
    setIsOpenSubMenuIndex(index);
    setIsOpenSubMenu_(!isOpenSubMenu_);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    context.setIsLogin(false);
    history("/signIn");
  };

  return (
    <nav>
      <div className="container">
        <div className="row">
          <div className="col-sm-2 navPart1 ">
            <div className="catWrapper">
              <Button
                className="allCatTab align-items-center res-hide"
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
                aria-label="Toggle categories menu"
              >
                <span className="icon1 mr-2">
                  <IoIosMenu />
                </span>
                <span className="text">ALL CATEGORIES</span>
                <span className="icon2  ml-2">
                  <FaAngleDown />
                </span>
              </Button>

              <div
                className={`sidebarNav ${
                  isopenSidebarVal === true ? "open" : ""
                }`}
              >
                <ul>
                  {props.navData?.map((item) => (
                    <li key={`cat-${item._id}`}>
                      <Link to={`/products/category/${item._id}`}>
                        <Button component="div">
                          <img
                            src={item?.images[0]}
                            width="20"
                            className="mr-2"
                            alt={item.name}
                          />
                          {item.name} <FaAngleRight className="ml-auto" />
                        </Button>
                      </Link>
                      {item?.children?.length > 0 && (
                        <div className="submenu">
                          {item.children.map((subCat) => (
                            <Link
                              to={`/products/subCat/${subCat._id}`}
                              key={`subcat-${subCat._id}`}
                            >
                              <Button component="div">{subCat.name}</Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`col-sm-10 navPart2 d-flex align-items-center res-nav-wrapper ${
              isOpenNav === true ? "open" : "close"
            }`}
          >
            <div
              className="res-nav-overlay"
              onClick={props.closeNav}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && props.closeNav()}
              aria-label="Close navigation"
            ></div>

            <div className="res-nav">
              {context.windowWidth < 992 && (
                <div className="pl-3">
                  <Link to="/" className="logo">
                    <img src={Logo} alt="website logo" />
                  </Link>
                </div>
              )}

              <ul className="list list-inline ml-auto">
                {context.windowWidth < 992 && (
                  <li className="list-inline-item">
                    <div className="p-3">
                      {context.countryList.length !== 0 &&
                        context.windowWidth < 992 && <CountryDropdown />}
                    </div>
                  </li>
                )}

                {props.navData
                  .filter((_, idx) => idx < 7)
                  .map((item, index) => (
                    <li className="list-inline-item" key={`main-nav-${item._id}`}>
                      <Link
                        to={`/products/category/${item._id}`}
                        onClick={props.closeNav}
                      >
                        <Button component="div">
                          <img
                            src={item.images[0]}
                            width="20"
                            className="mr-2"
                            alt={item.name}
                          />
                          {item.name}
                        </Button>
                      </Link>

                      {item?.children?.length > 0 && context.windowWidth < 992 && (
                        <button
                          type="button"
                          className={`arrow ${
                            isOpenSubMenuIndex === index &&
                            isOpenSubMenu_ === true &&
                            "rotate"
                          }`}
                          onClick={() => IsOpenSubMenu(index)}
                          aria-label={`Toggle ${item.name} submenu`}
                        >
                          <FaAngleDown />
                        </button>
                      )}

                      {item?.children?.length > 0 && (
                        <div
                          className={`submenu ${
                            isOpenSubMenuIndex === index &&
                            isOpenSubMenu_ === true &&
                            "open"
                          }`}
                        >
                          {item.children.map((subCat) => (
                            <Link
                              to={`/products/subCat/${subCat._id}`}
                              key={`sub-nav-${subCat._id}`}
                              onClick={props.closeNav}
                            >
                              <Button component="div">{subCat.name}</Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>

              {context.windowWidth < 992 && (
                <>
                  {context?.isLogin === false ? (
                    <div className="pt-3 pl-3 pr-3">
                      <Link to="/signIn">
                        <Button className="btn-blue w-100 btn-big">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div 
                      className="pt-3 pl-3 pr-3"
                      role="button"
                      tabIndex={0}
                      onClick={logout}
                      onKeyDown={(e) => e.key === 'Enter' && logout()}
                    >
                      <Button className="btn-blue w-100 btn-big">
                        <RiLogoutCircleRFill /> Logout
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;