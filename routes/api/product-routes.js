const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products and their associated Category and Tag data
  try {
    const productsData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    return res.status(200).json(productsData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id` including its associated Category and Tag data
  try {
    const { id } = req.params;
    const productsData = await Product.findByPk(id, {
      include: [{ model: Category }, { model: Tag }],
    });
    if (!productsData) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(productsData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    await Product.create({
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    });

    const productsData = await Product.findOne({
      where: { product_name: req.body.product_name },
    });

    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: productsData.id,
        tag_id,
      }));
      ProductTag.bulkCreate(productTagIdArr);
    }
    return res.status(201).json(productsData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const toUpdate = await Product.findByPk(req.params.id);
    if (!toUpdate) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // update product data
    await Product.update(
      {
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });

    // get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => ({
        product_id: req.params.id,
        tag_id,
      }));

    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // run both actions
    await ProductTag.destroy({ where: { id: productTagsToRemove } });
    await ProductTag.bulkCreate(newProductTags);

    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    return res.status(200).json(productData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productsData = await Product.destroy({
      where: { id: req.params.id },
    });

    if (!productsData) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(productsData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
