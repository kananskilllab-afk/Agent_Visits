const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkImportUsers
} = require('../controllers/users.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.post('/bulk-import', bulkImportUsers);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
