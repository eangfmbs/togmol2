var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;

// https://stackoverflow.com/questions/8455685/how-to-implement-post-tags-in-mongo

var statusSchema = new Schema({
  profile: {type: String, required: true, default: 'http://res.cloudinary.com/kit/image/upload/v1518707831/wexshb3qh0pyq5dkbaze.png'},
  title: {type: String, required: true},
  content: {type: String, required: false},
  url: {type: String, required: true, default: 'https://togmol.com'},
  likeby: {type: Array, required: false},
  tags: [
    {type: String, required: false}
  ],
  // tags: [{
  //   tag: {type: String, required: true} //to show that just the same to above code
  // }
  // ],
  comments: [
    {
      profile: {type: String, required: true, default: 'http://res.cloudinary.com/kit/image/upload/v1518707831/wexshb3qh0pyq5dkbaze.png'},
      comment: {type: String, required: false},
      commentator: {type: String, required: true},
      totalcomment: {type: Number, required: false, default: 1}, //default 1 is mean that we are alr add 1 point/comment for maincoment it will use whil we are delete maincomment and decrease total ans
      date: {type: Date, required: true, default: Date.now},
      vote: {type: Number, required: false, default: 0},
      voteby: {type: Array, required: false},
      replies: [
        {
          profile: {type: String, required: true, default: 'http://res.cloudinary.com/kit/image/upload/v1518707831/wexshb3qh0pyq5dkbaze.png'},
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
