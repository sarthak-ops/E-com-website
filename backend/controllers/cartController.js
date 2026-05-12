const Cart = require("../models/Cart");
const cart = require("../models/Cart")

exports.addToCart = async (req, res) => {
    try{
        const userId = req.user.id;
        const { productId, quantity} = req.body;

        let cart = await Cart.findOne({ user: userId });

        if(!cart){
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if(existingItem){
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.save();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getCart = async (req, res) => {
    try{
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.product");

        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};