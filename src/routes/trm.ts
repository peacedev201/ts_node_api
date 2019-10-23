const router = require('express').Router();
const CompanyClass = require('../controller/companyController')
var company = new CompanyClass()

router.get('/', company.list)
router.post('/', company.new);

module.exports = router;