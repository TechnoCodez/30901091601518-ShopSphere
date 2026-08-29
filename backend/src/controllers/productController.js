const prisma = require("../config/prismaClient");

const getProducts = async (req, res) => {
  try {
    const { keyword, category, sort, page = 1, limit = 10 } = req.query;

    const where = {};
    if (keyword) {
      where.name = { contains: keyword, mode: "insensitive" };
    }
    if (category) {
      where.categoryId = category;
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "name_asc") orderBy = { name: "asc" };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: { category: true }
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
        include: { category: true }
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name || !description || !price || !categoryId || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        categoryId,
        stock: stock ? Number(stock) : 0,
        imageUrl
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const { name, description, price, categoryId, stock } = req.body;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? product.name,
        description: description ?? product.description,
        price: price ? Number(price) : product.price,
        categoryId: categoryId ?? product.categoryId,
        stock: stock !== undefined ? Number(stock) : product.stock,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
