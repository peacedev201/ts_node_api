import mongoose = require('mongoose');
import mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');
// Define the Company model schema
const CompanySchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: false   
  },
  source: {
    type: String,
    required: false  
  },
  time: {
    type: Date,
    required: false  
  },
  target: {
    type: String,
    required: false  
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

CompanySchema.plugin(mongoosePaginate);
CompanySchema.plugin(timestamps);

/**
 * Override default toJSON, remove password field and __v version
 */
CompanySchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.__v;
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Company', CompanySchema);
