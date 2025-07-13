import { FaMinus, FaPlus } from "react-icons/fa6";
import Button from '@mui/material/Button';
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import PropTypes from 'prop-types';

const QuantityBox = ({ value, item, quantity, selectedItem }) => {
    const [inputVal, setInputVal] = useState(1);
    const context = useContext(MyContext);

    useEffect(() => {
        if (value !== undefined && value !== null && value !== "") {
            setInputVal(parseInt(value));
        }
    }, [value]);

    const handleMinus = () => {
        if (inputVal > 1) {
            const newValue = inputVal - 1;
            setInputVal(newValue);
            updateQuantity(newValue);
        }
        context.setAlertBox({ open: false });
    };

    const handlePlus = () => {
        const stock = parseInt(item?.countInStock || 10);
        if (inputVal < stock) {
            const newValue = inputVal + 1;
            setInputVal(newValue);
            updateQuantity(newValue);
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Quantity exceeds available stock"
            });
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && value <= item?.countInStock) {
            setInputVal(value);
            updateQuantity(value);
        }
    };

    const updateQuantity = (value) => {
        if (quantity) quantity(value);
        if (selectedItem) selectedItem(item, value);
    };

    return (
        <div className='quantityDrop d-flex align-items-center'>
            <Button 
                onClick={handleMinus} 
                aria-label="Decrease quantity"
                disabled={inputVal <= 1}
            >
                <FaMinus />
            </Button>
            <input 
                type="number" 
                value={inputVal} 
                onChange={handleInputChange}
                min="1"
                max={item?.countInStock}
                aria-label="Product quantity"
            />
            <Button 
                onClick={handlePlus} 
                aria-label="Increase quantity"
                disabled={inputVal >= item?.countInStock}
            >
                <FaPlus />
            </Button>
        </div>
    );
};

QuantityBox.propTypes = {
    value: PropTypes.number,
    item: PropTypes.object.isRequired,
    quantity: PropTypes.func,
    selectedItem: PropTypes.func
};

export default QuantityBox;