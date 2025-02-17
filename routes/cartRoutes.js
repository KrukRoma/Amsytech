const express = require("express");
const router = express.Router();
const {
    addItemToCart,
    updateCartItem,
    deleteCartItem,
    getCartItems
} = require('../controllers/cartController');

router.post('/add', addItemToCart);
router.patch('/update', updateCartItem);
router.delete('/delete/:cartId', deleteCartItem);
router.get('/:userId', getCartItems);

module.exports = router;