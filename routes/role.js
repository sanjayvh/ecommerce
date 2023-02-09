const router = require('express').Router();
const rolesController = require('../controller/role');

router.get('/roles', rolesController.getAllRoles);

router.post('/roles', rolesController.postRoles);

router.delete('/roles', rolesController.deleteRoles);

module.exports = router;