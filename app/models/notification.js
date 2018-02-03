var mongoose    = require('mongoose');
var validate    = require('mongoose-validator');
var Schema      = mongoose.Schema;

var ntfSchema = new Schema({
  createdate: {type: Date, required: true, default: Date.now},
  ntftext: {type: String, required: false},
  isview: {type: String, required: true, default: false},
  username: {type: String, required: true} //usename is the user of owner status
})

module.exports = mongoose.model('NOTIFICATION', ntfSchema);
