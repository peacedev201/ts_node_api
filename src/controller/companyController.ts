const config = require('../config');
const request = require("request");

var Company: any
class CompanyController {

  constructor() {
    require('../models').connect(config.dbUri);
    Company = require('mongoose').model('Company');

  }

  list(req: any, res: any, next: any) {
    var limit = parseInt(req.query['limit'], 10);
    const pageOptions = {
      page: req.query['page'] || 1,
      limit: limit || 1000,
      sort: req.query['sort'] || 'time asc'
    };

    let filterOptions: any;
    if (req.query['filter']) {
      try {
        const filterParam = JSON.parse(req.query['filter']);
        if (Array.isArray(filterParam) && filterParam.length > 0) {
          filterParam.forEach((item) => {
            filterOptions[item.id] = new RegExp(item.value, 'i');
          });
        }
      } catch (err) {
        console.log("Could not parse \'filter\' param ")

      }
    }

    Company.paginate(filterOptions, pageOptions, (err: any, result: any) => {
      if (err) {
        console.log("error ", err)
        return res.status(500).json({
          success: false,
          errors: [JSON.stringify(err)]
        });
      }

      result.success = true;
      return res.json(result);
    });
  };


  // GET /api/companies/:id
  find(req: any, res: any, next: any) {

    Company.findById(req.params.id, (err: any, company: any) => {
      if (err || !company) {
        if (err) console.log("error ", err)
        return res.status(404).json({
          success: false,
          errors: [err ? err.message : `company id '${req.params.id} not found'`]
        });
      }

      return res.json({
        success: true,
        data: company
      });
    });
  };


  // POST /api/companies
  // Add new company
  new(req: any, res: any, next: any) {
    if (!req.body.source || !req.body.target) {
      return res.status(409).json({ success: false, errors: [' param is required'] });
    }
    var source = req.body.source;
    var target = req.body.target;

    request.get(
      "https://transferwise.com/gb/currency-converter/api/historic?source=" +
      source +
      "&target=" +
      target +
      "&period=30"
      , async (error: any, response: any, body: any) => {
        var data = JSON.parse(body)
        if (error) {
          return res.json({ success: false, errors: [error.message] });
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            Company.create({ rate: data[i]['rate'], source: data[i]['source'], time: data[i]['time'], target: data[i]['target'] }, (err: any) => {
              if (err) {
                return res.json({ success: false, errors: [err.message] });
              }
            })
          }
          res.status(200).send({ success: true, message: "data inserted" });
        } else {
          res.status(500).send({
            message: "source and target not found"
          });
        }

        // res.status(200).send({ success: true, message: "data inserted" });
      }
    );
  };

  newTRMCron() {
    var source = "USD";
    var target = "UYU";
    return new Promise((res, rej) => {
      request.get(
        "https://transferwise.com/gb/currency-converter/api/historic?source=" +
        source +
        "&target=" +
        target +
        "&period=30"
        , async (error: any, response: any, body: any) => {
          var data = JSON.parse(body)
          if (error) {
            return rej({ success: false, errors: [error.message] });
          }
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              Company.create({ rate: data[i]['rate'], source: data[i]['source'], time: data[i]['time'], target: data[i]['target'] }, (err: any) => {
                if (err) {
                  return rej({ success: false, errors: [err.message] });
                }
              })
            }
            res({ success: true, message: "data inserted" });
          } else {
            rej({
              message: "source and target not found"
            });
          }

          // res.status(200).send({ success: true, message: "data inserted" });
        }
      );
    })


  }
}
module.exports = CompanyController
