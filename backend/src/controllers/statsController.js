const prisma = require('../config/prismaClient');

const getStoreStats = async (req, res) => {
  try {
    const [totalProducts, totalUsers, totalCustomers, totalAdmins, totalCartItems, products] =
      await Promise.all([
        prisma.product.count(),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.cartItem.count(),
        prisma.product.findMany({ select: { price: true, stock: true } }),
      ]);

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    );

    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    res.json({
      totalProducts,
      totalUsers,
      totalCustomers,
      totalAdmins,
      totalCartItems,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      lowStockCount,
      outOfStockCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStoreStats };