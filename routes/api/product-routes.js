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
    res.status(200).json(productsData);
  } catch (error) {
    res.status(500).json(error);
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
    res.status(200).json(productsData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// create new product
router.post('/', (req, res) => {
  // create a new product
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category,
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => ({
          product_id: product.id,
          tag_id,
        }));
        ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      // res.status(200).json(product);
      return product;
    })
    .then((productTagIds) => res.status(201).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category,
  }, {
    where: {
      id: req.params.id,
    },
  })
    .then(() => 
      // find all associated tags from ProductTag
       ProductTag.findAll({ where: { product_id: req.params.id } })
    )
    .then((productTags) => {
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
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
});

module.exports = router;
