var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;

// https://stackoverflow.com/questions/8455685/how-to-implement-post-tags-in-mongo

var statusSchema = new Schema({
  title: {type: String, required: true},
  content: {type: String, required: false},
  url: {type: String, required: true, default: 'https://togmol.com'},
  tags: [
    {type: String, required: false}
  ],
  // tags: [{
  //   tag: {type: String, required: true} //to show that just the same to above code
  // }
  // ],
  comments: [
    {
      comment: {type: String, required: false},
      commentator: {type: String, required: true},
      date: {type: Date, required: true, default: Date.now},
      vote: {type: Number, required: false, default: 0},
      voteby: {type: Array, required: false},
      replies: [
        {
          comment: {type: String, required: false},
          commentator: {type: String, required: false},
          date: {type: Date, required: true, default: Date.now},
          vote: {type: Number, required: false, default: 0},
          voteby: {type: Array, required: false}
        }
      ]
    }
  ],
  totallike: {type: Number, required: false, default: 0},
  statusview: {type: Number, required: false, default: 0},
  totalcomment: {type: Number, required: false, default: 0},
  totalshare: {type: Number, required: false, default: 0},
  date: {type: Date, required: true, default: Date.now},
  username: {type: String, required: true}
})

module.exports = mongoose.model('Status', statusSchema);
