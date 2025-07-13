import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery, TbDiscount2 } from "react-icons/tb";
import { CiBadgeDollar } from "react-icons/ci";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import newsLetterImg from "../../assets/images/newsletter.png";
import Button from "@mui/material/Button";
import { IoMailOutline } from "react-icons/io5";

const Footer = () => {
  const footerLinks = [
    {
      title: "FRUIT & VEGETABLES",
      links: [
        "Fresh Vegetables",
        "Herbs & Seasonings",
        "Fresh Fruits",
        "Cuts & Sprouts",
        "Exotic Fruits & Veggies",
        "Packaged Produce",
        "Party Trays"
      ]
    },
    {
      title: "BREAKFAST & DAIRY",
      links: [
        "Milk & Flavored Milk",
        "Butter & Margarine",
        "Cheese",
        "Eggs",
        "Yogurt",
        "Cereal"
      ]
    },
    {
      title: "MEAT & SEAFOOD",
      links: [
        "Beef",
        "Chicken",
        "Pork",
        "Lamb",
        "Fish",
        "Shrimp",
        "Shellfish"
      ]
    },
    {
      title: "BEVERAGES",
      links: [
        "Water",
        "Soda",
        "Juice",
        "Coffee",
        "Tea",
        "Energy Drinks",
        "Sports Drinks"
      ]
    },
    {
      title: "BREADS & BAKERY",
      links: [
        "Sandwich Bread",
        "Baguettes",
        "Muffins",
        "Bagels",
        "Croissants",
        "Cookies",
        "Cakes"
      ]
    }
  ];

  return (
    <>
      <section className="newsLetterSection mt-3 mb-3 d-flex align-items-center">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-white mb-1">
                $20 discount for your first order
              </p>
              <h2 className="text-white">Join our newsletter and get...</h2>
              <p className="text-light">
                Join our email subscription now to get updates on
                <br /> promotions and coupons.
              </p>

              <form className="mt-4 d-flex align-items-center">
                <div className="input-group">
                  <span className="input-group-text">
                    <IoMailOutline />
                  </span>
                  <input 
                    type="email" 
                    placeholder="Your Email Address" 
                    aria-label="Email address"
                    className="form-control"
                    required
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    aria-label="Subscribe to newsletter"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
            </div>

            <div className="col-md-6 text-center">
              <img 
                src={newsLetterImg} 
                alt="Newsletter promotion showing discount offer" 
                className="img-fluid"
                width="400"
                height="300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-light">
        <div className="container py-4">
          <div className="row g-4 mb-4">
            {[
              {
                icon: <LuShirt size={24} />,
                text: "Everyday fresh products"
              },
              {
                icon: <TbTruckDelivery size={24} />,
                text: "Free delivery for order over $70"
              },
              {
                icon: <TbDiscount2 size={24} />,
                text: "Daily Mega Discounts"
              },
              {
                icon: <CiBadgeDollar size={24} />,
                text: "Best price on the market"
              }
            ].map((item, index) => (
              <div className="col-md-3 col-6" key={index}>
                <div className="d-flex align-items-center">
                  <span className="me-2 text-primary">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {footerLinks.map((section, index) => (
              <div className="col-md-2 col-6" key={index}>
                <h5 className="h6">{section.title}</h5>
                <ul className="list-unstyled">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="mb-2">
                      <Link 
                        to={`/category/${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-decoration-none"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4 mt-4 border-top">
            <p className="mb-3 mb-md-0">
              &copy; {new Date().getFullYear()} FreshMart. All rights reserved
            </p>
            <div className="social-icons">
              {[
                {
                  icon: <FaFacebookF aria-label="Facebook" />,
                  url: "https://facebook.com"
                },
                {
                  icon: <FaTwitter aria-label="Twitter" />,
                  url: "https://twitter.com"
                },
                {
                  icon: <FaInstagram aria-label="Instagram" />,
                  url: "https://instagram.com"
                }
              ].map((social, index) => (
                <Link 
                  to={social.url} 
                  key={index}
                  className="text-decoration-none me-3"
                  aria-label={social.icon.props['aria-label']}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;