var mongoose    = require('mongoose');
var validate    = require('mongoose-validator');
var Schema      = mongoose.Schema;

var ntfSchema = new Schema({
    createdate: {type: Date, required: true, default: Date.now},
    ntftext: {type: String, required: false},
    isview: {type: Number, required: true, default: 0},
    statusid: {type: String, required: false},
    ownertalk: {type: String, required: true}, //usename is the user of owner status
    actionusername: {type: String, required: true}
})

module.exports = mongoose.model('NOTIFICATION', ntfSchema);
