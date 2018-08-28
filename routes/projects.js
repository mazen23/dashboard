const express = require('express');
const router = express.Router();

const project_controller = require('../controllers/projectController');

router.get('/', project_controller.project_list);

router.post('/', project_controller.project_create);

router.get('/:ProjectId', project_controller.project_detail);

router.patch('/:ProjectId', project_controller.project_patch);

router.delete('/:ProjectId', project_controller.project_delete);

module.exports = router;