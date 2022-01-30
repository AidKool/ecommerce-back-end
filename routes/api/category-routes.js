const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories and their associated Products
  try {
    const categoriesData = await Category.findAll({
      include: [{ model: Product }],
    });
    return res.status(200).json(categoriesData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value and its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json(categoryData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    await Category.create({
      category_name: req.body.category_name,
    });
    const categoryData = await Category.findOne({
      where: { category_name: req.body.category_name },
    });
    return res.status(201).json(categoryData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    await Category.update(req.body, { where: { id: req.params.id } });
    const categoryData = await Category.findOne({
      where: { id: req.params.id },
    });
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json(categoryData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: { id: req.params.id },
    });
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json(categoryData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
