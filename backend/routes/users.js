const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - 查询用户（登录）
router.get('/', userController.userLogin);

// POST /api/users - 注册用户
router.post('/', userController.userRegister);

module.exports = router;
