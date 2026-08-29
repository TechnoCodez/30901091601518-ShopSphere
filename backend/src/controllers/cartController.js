const prisma = require('../config/prismaClient');

const getCart = async (req, res) => {
    try {
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: { items: true }
        });
    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId: req.user.id },
            include: { items: true }
        });
    } 
    res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId: req.user.id } });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + Number(quantity)}
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity: Number(quantity) }
            });
        }
        

        

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: true }
        });

        res.status(201).json(updatedCart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}


const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (Number(quantity) <= 0) {
            await prisma.cartItem.delete({ where: { id: item.id } });
        } else {
            await prisma.cartItem.update({
                where: { id: item.id },
                data: { quantity: Number(quantity) }
            });
        }

        const cart = await prisma.cart.findUnique({
            where: { id: item.cartId },
            include: { items: true }
        });
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        await prisma.cartItem.delete({ where: { id: item.id } });

        const cart = await prisma.cart.findUnique({
            where: { id: item.cartId },
            include: { items: true }
        });
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };