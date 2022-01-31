const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags and their associated Product data
  try {
    const tagsData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    return res.status(200).json(tagsData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id` and its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });
    if (!tagData) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    return res.status(200).json(tagData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    await Tag.create(req.body);
    const tagData = await Tag.findOne({
      where: { tag_name: req.body.tag_name },
    });
    return res.status(201).json(tagData);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    await Tag.update(req.body, { where: { id: req.params.id } });
    const tagData = await Tag.findByPk(req.params.id);
    if (!tagData) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    return res.status(200).json(tagData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const deletedTags = await Tag.destroy({ where: { id: req.params.id } });
    if (!deletedTags) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    return res.status(200).json({ deletedTags });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
