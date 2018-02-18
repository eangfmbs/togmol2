var User        = require('../models/user');
var Status      = require('../models/status');
var NTF         = require('../models/notification');
var TagType     = require('../models/tagtype');
var imageHelper = require('../imagehelper/imagehelper');
var jwt         = require('jsonwebtoken');
var nodemailer  = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var secret      = 'intelligent'; //whatever it just a secret
var countComment = 0;
var currentTotal = 0;
var countLike    = 0;
var currentLike  = 0;
var countView    = 0;
var currentView  = 0;
var countVote    = 0;
var currentVote  = 0;
var isocket;
var clients = {};
// to family and friend i would give what i have. to person i love i would give what don't have it

//create new user route (http://localhost:8080/api/users)
module.exports = function (router, io) {

    io.on('connection', function(socket) {
        isocket = socket;

        // clients.push(socket.id);
        socket.on('add-user', function(data){
          console.log('connection user: ', data.username)

        clients[data.username] = {
          "socket": socket.id
        };
        console.log('data of connection user: ', clients)
      });


    socket.on('disconnect', function() {
    	for(var name in clients) {
    		if(clients[name].socket === socket.id) {
    			delete clients[name];
    			break;
    		}
    	}
    })
        //
        // let token = socket.handshake.query.token;
        // global.activeSocketUser[token] = socket;
        // socket.emit('notification', "comment")
        // console.log("what is global: ", global.activeSocketUser[token]);
        // socket.on('disconnect', function(){
        //   let token = socket.handshake.query.token;
        //   global.activeSocketUser[token] = null;
        // })


  // console.log('route is:', router)


    //email configuration
    var options = {
        auth: {
            //this api is all the account that we use to login sendgrid account
            api_user:'eangfmbs',
            api_key:'fmbsloynas1'
        }
    }

    var client = nodemailer.createTransport(sgTransport(options));

    //http://localhost:8080/api/users
    //User REGISTRATION ROUTE
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email    = req.body.email;
        user.temporarytoken = jwt.sign({username: user.username, email: user.email},secret, {expiresIn:'24h'});
        if(user.username=='' ||user.password=='' ||user.email=='' || user.username==undefined ||user.password==undefined ||user.email==undefined){
            res.json({success:false, message:'Please make sure all box is filled'})
        } else {
            user.save(function (err) {
                if(err){
                    if(err.errors!=null){
                        if(err.errors.email){
                            return res.json({success: false, message: err.errors.email.message});
                        } else if(err.errors.username){
                            return res.json({success: false, message: err.errors.username.message});
                        } else if(err.errors.password){
                            return res.json({success: false, message: err.errors.password.message});
                        } else {
                            return res.json({success:false, message: err})
                        }
                    } else if(err){
                        if(err.code == 11000){
                            if(err.errmsg[61]=='e'){
                                return res.json({success:false, message: 'Email address is already taken'})
                            } else if(err.errmsg[61]=='u'){
                                return res.json({success: false, message: 'Username is already taken'})
                            }
                        }
                        else{
                            return res.json({success:false, message: err})
                        }
                    }
                } else {
                    //email part
                    var email = {
                        from: 'togmol.com',
                        to: user.email,
                        subject: 'Activation your togmol link',
                        text: 'Hello '+ user.username + 'this is your activation link for activation togmol account please click on the link below to' +
                        ' complete your activation http://localhost:8080/activate/'+ user.temporarytoken,
                        html: '<b>Hello </b><strong>' + user.username +'</strong> this is your activation link for activation togmol account please click on the link below to' +
                        ' complete your activation <br>' +
                        '<a href="http://localhost:8080/activate/'+ user.temporarytoken +'">http://localhost:8080/activate/</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if(err) {
                            console.log("This is error from sendMail", err);
                        } else {
                            console.log('Msg Send: ', info.response);
                        }
                    });
                    //end email part

                    res.json({success:true, message:'Congratulation! User has been created. Please check your email for activation link'})
                }
            });
        }
    });
//check for username while login
    router.post('/checkusername', function (req, res) {
        User.findOne({username: req.body.username}).select('username').exec(function (err, user) {
            if(err) return handleError(err);
            if(user){
                res.json({success: false, message: 'username is already exist'})
            } else {
                res.json({success: true, message: 'your username is good to go'})
            }
        })
    });

    //check for password while login
    router.post('/checkemail', function (req, res) {
        User.findOne({email: req.body.email}).select('email').exec(function (err, user) {
            if(err) return handleError(err);
            if(user){
                res.json({success: false, message: 'email is already exist'})
            } else {
                res.json({success: true, message: 'your email is good to go'})
            }
        })
    });

    // USER LOGIN ROUTE
    //create new LOGIN route (http://localhost:8080/api/authenticate) with providing token to the user with a secret and keep them login in 24h
    router.post('/authenticate', function (req, res) {
        User.findOne({username: req.body.username}).select('username password email activate').exec(function (err, user) {
                if(err) return handleError(err);
                if(!user){
                    return res.json({success:false, message: "Can not authenticate. Maybe your username isn't correct!"})
                } else if(user) {
                    if(req.body.password){
                        var validPassword = user.comparePassword(req.body.password);
                    } else {
                        return res.json({success:false, message: "No password provided"})
                    }
                    if(!validPassword){
                        return res.json({success:false, message: "Your password is doesn't correct!"})
                    } else if(!user.activate){
                        return res.json({success: false, expired: true, message: "You haven't activate your account yet. Please go to you email and click activate account first or just click on this to get new link for activation"})
                    }
                    else {
                        var token = jwt.sign({username: user.username, email: user.email},secret, {expiresIn:'24h'});
                        return res.json({success:true, message: "Authenticate Successfully", token: token});
                    }
                }
            })
    });

    // USER Resend for activation account
    router.post('/resend', function (req, res) {
        User.findOne({username: req.body.username}).select('username password activate').exec(function (err, user) {
            if(err) return handleError(err);
            if(!user){
                return res.json({success:false, message: "Can not authenticate. Maybe your username isn't correct!"})
            } else if(user) {
                if(req.body.password){
                    var validPassword = user.comparePassword(req.body.password);
                } else {
                    return res.json({success:false, message: "No password provided"})
                }
                if(!validPassword){
                    return res.json({success:false, message: "Your password is doesn't correct!"})
                } else if(user.activate){
                    return res.json({success: true, message: "Your account is already activated"})
                }
                else {
                    return res.json({success: true, user: user});
                }
            }
        })
    });

    //route send to update resend activation of token
    router.put('/resend', function (req, res) {
        User.findOne({username: req.body.username}).select('username temporarytoken activate email').exec(function (err, user) {
            if(err){
                return handleError(err);
            } else {
                user.temporarytoken = jwt.sign({username: user.username, email: user.email},secret, {expiresIn:'24h'});
                user.save(function (err) {
                    if(err){
                        return handleError(err);
                    } else {
                        //email part
                        var email = {
                            from: 'togmol.com',
                            to: user.email,
                            subject: 'Request Activation Link',
                            text: 'Hello '+ user.username + 'you recently requested for activation togmol account please click on the link below to' +
                            ' complete your activation http://localhost:8080/activate/'+ user.temporarytoken,
                            html: '<b>Hello </b><strong>' + user.username +'</strong> you recently requested for activation togmol account please click on the link below to' +
                            ' complete your activation <br>' +
                            '<a href="http://localhost:8080/activate/'+ user.temporarytoken +'">http://localhost:8080/activate/</a>'
                        };

                        client.sendMail(email, function (err, info) {
                            if(err) {
                                console.log("This is error from sendMail", err);
                            } else {
                                console.log('Msg Send: ', info.response);
                            }
                        });
                        //end email part
                        return res.json({success:true, message: 'Activation link has been send to '+user.email+'!'})
                    }
                })
            }
        })
    })

    //get token from email
    router.put('/activate/:token', function (req, res) {
        User.findOne({temporarytoken: req.params.token}, function (err, user) {
            if(err) {
                throw err;
            }
            var token = req.params.token;
            jwt.verify(token,secret,function (err, decoded) {
                if(err) {
                    res.json({success:false, message: "Activation link has expired"})
                }else if(!user) {
                    res.json({success:false, message: "Activation link has expired"})
                }
                else {
                    //clear some variable and update data in DB
                    user.temporarytoken = false;
                    user.activate = true;
                    user.save(function (err) {
                        if(err) {
                            console.log("Error from email token: ", err)
                        } else {
                            var email = {
                                from: 'togmol.com',
                                to: user.email,
                                subject: 'Congrats from togmol activation account',
                                text: 'Hello '+ user.username + '. Your account is now successfully activated' +
                                ' complete your activation http://localhost:8080/activate/'+ user.temporarytoken,
                                html: '<b>Hello </b><strong>'+user.username+'</strong> . Your account is now successfully activated'
                            };

                            client.sendMail(email, function (err, info) {
                                if(err) {
                                    console.log(error);
                                } else {
                                    console.log('Msg Send: ', info.response);
                                }
                            });

                            res.json({success:true, message: "togmol account is successfully activated"})
                        }
                    })
                }
            })


        })
    });

    //Route Forget username
    router.get('/forgetusername/:email', function (req, res) {
        User.findOne({email: req.params.email}).select('email username activate').exec(function (err, user) {
            if(err) {
                return handleError(err);
            } else {
                if(!req.params.email){
                    return res.json({success: false, message: "You haven't provided any email"})
                } else {
                    if(!user){
                        return res.json({success: false, message: 'E-mail was not found in db'})
                    } else if(!user.activate){
                        return res.json({success: false, message: "You haven't activated your account yet. We will allow to request to see your username unless your account has already activated"})
                    }
                    else {
                        var email = {
                            from: 'togmol.com',
                            to: user.email,
                            subject: 'Forget togmol username',
                            text: 'Hello! We found that you are recently requested for your username that you forgot' +
                            ' and here it is: '+ user.username,
                            html: '<b>Hello </b>Hello! We found that you are recently requested for your username that you forgot' +
                            ' and here it is: '+user.username
                        };

                        client.sendMail(email, function (err, info) {
                            if(err) {
                                console.log(error);
                            } else {
                                console.log('Msg Send: ', info.response);
                            }
                        });

                        return res.json({success: true, message: 'Your username has been send to '+user.email+' please go and check it'})
                    }
                }

            }
        })
    });

    //Route forget password and request to email to get new one
    router.put('/forgetpassword', function (req, res) {
        //we need a token to send to the user to get new token
        User.findOne({email: req.body.password}).select('username email activate resettoken').exec(function (err, user) {
            if(err){
                return handleError(err);
            }
            if(!user){
                return res.json({success: false, message: 'Your email not found in our DB'})
            } else if(!user.activate){
                return res.json({success: false, message: "You haven't activated your account yet. We will allow to reset new password unless your account has already activated"})
            }
            else {
                //when user have token they are allow to set new password because token tell that this is ur valid account
                user.resettoken = jwt.sign({username: user.username, email: user.email},secret, {expiresIn:'24h'});
                user.save(function (err) {
                    if(err){
                        return handleError(err);
                    } else {
                        var email = {
                            from: 'togmol.com',
                            to: user.email,
                            subject: 'Forget togmol password',
                            text: 'Hello! We found that you are recently requested for new password' +
                            ' please click on the link below to set new password:  http://localhost:8080/resetpassword/'+ user.resettoken,
                            html: '<b>Hello </b><strong>' + user.username +'</strong> you recently requested for new password please click on the link below to' +
                            ' set new password <br>' +
                            '<a href="http://localhost:8080/resetpassword/'+ user.resettoken +'">http://localhost:8080/resetpassword/</a>'
                        };

                        client.sendMail(email, function (err, info) {
                            if(err) {
                                console.log(error);
                            }
                        });

                        return res.json({success: true, message: 'Now you can go to your email and request for new password'})
                    }
                })

            }
        })
    });

    //Route set new password that receive from the email
    router.get('/forgetpassword/:token', function (req, res) {

        User.findOne({resettoken: req.params.token}).select().exec(function (err, user) {
            if(err) {
                return handleError(err);
            }
            var token = req.params.token;
            jwt.verify(token,secret,function (err, decoded) {
                if(err) {
                    return res.json({success:false, message: "Your token is not validated or have been remove from the system after 24h mean that it is expired"})
                } else {
                    console.log("The user token is: ",token);
                    if(!user){
                        return res.json({success: false, message: 'Your token is expired'})
                    } else {
                    res.json({success: true, user:user})
                    }
                }
            });
            // return res.json({success: true, message: "Please enter your new password!"})
        })
    });

    //Route save password after reset for new password
    router.put('/savenewpassword', function (req, res) {
        User.findOne({username: req.body.username}).select('username password email').exec(function (err, user) {
            if(err){
                handleError(err);
            }
            if(req.body.password!=undefined || req.body.password != ''){
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function (err) {
                    if(err){
                        return res.json({success: false, message: err})
                    } else{
                        var email = {
                            from: 'togmol.com',
                            to: user.email,
                            subject: 'Successfully Reset Password',
                            text: 'Congratulation ' + user.username + 'your new password has been reset already. pleas go to togmol.com and try to login with your new password',
                            html: '<b>Congratulation </b><strong>' + user.username +'</strong> your new password has been reset already. pleas go to togmol.com and try to login with your new password'
                        };

                        client.sendMail(email, function (err, info) {
                            if(err) {
                                console.log(error);
                            } else {
                                console.log('Msg Send: ', info.response);
                            }
                        });
                        return res.json({success: true, message: "Password is reset successfully!"})
                    }
                })
            } else {
                return res.json({success: false, message: "Password has not provided yet"})
            }
        })
    })

    //use middleware to decrypt the token
    router.use(function (req, res, next) {
        var token = req.body.token||req.body.query||req.headers['x-access-token'];
        if(token){
            //verify that is that valid token
            jwt.verify(token,secret,function (err, decoded) {
                if(err) {
                    res.json({success:false, message: "Your token is not validated or have been remove from the system after 24h"})
                } else {
                    req.decoded = decoded; //make it accessible in '/me' route as well as all other route below this middleware
                    next();
                }
            })
        } else {
            res.json({success: false, message: "No token provided!"})
        }
    });

    //route to get the current user whose login
    router.post('/me', function (req, res) {
        res.send(req.decoded)
    });

    //create a route to get what permission that user has
    router.get('/permission', function (req, res) {
        User.findOne({username: req.decoded.username}, function (err, user) {
            if(err) handleError(err);
            return res.json({success: true, permission: user.permission})
        })
    });

    //a route to fetch all data for management control.
    router.get('/management', function (req, res) {
        User.find({}, function (err, users) {
            if(err){
                return handleError(err);
            }
            User.findOne({username: req.decoded.username}, function (err, mainUser) { //to verify that user have permission to pull data out or not
                if(err){
                    handleError(err);
                }
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    return res.json({success: true, users: users, permission: mainUser.permission})
                } else {
                    return res.json({success: false, message: "You do not have the permission to control on this management!"})
                }
            })
        })
    });

    //route on click to delete user
    router.delete('/management/:username', function(req, res){
      var deleteUser = req.params.username;
      User.findOne({username: req.decoded.username}, function(err, mainUser){
        if(err){
          return handleError(err);
        }
        if(mainUser.permission !== 'admin'){
          return res.json({success: false, message: 'Insuficient Permission!'});
        } else {
          User.findOneAndRemove({username: deleteUser}, function(err, user){
            if(err){
              handleError(err);
            } else {
              return res.json({success: true, message: 'User is deleted from DB'});
            }
          })
        }
      })
    })

    //route to catch _id from url when admin or moderator updata updateData
    router.get('/editusername/:id', function(req, res){
      var editUsernameId = req.params.id;
      User.findOne({username: req.decoded.username}, function(err, mainUser){
        if(err){
          return handleError(err);
        }
        if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
          User.findOne({_id: editUsernameId}, function(err, user){
            if(err){
              return handleError(err);
            } else {
              res.json({success: true, user:user})
            }
          })
        } else {
          return res.json({success: false, message: 'You are Insufficience Permission'})
        }
      })
    })

    //route reponsible for update/edit all data in Mangaement such as username, email, permission
    router.put('/editmanagement', function(req, res){
      var editUser = req.body._id;
      if(req.body.username) var newUsername = req.body.username; //if username is provided and so on for other ifs
      if(req.body.email) var newEmail = req.body.email;
      if(req.body.permission) var newPermission = req.body.permission;
      User.findOne({username: req.decoded.username}, function(err, mainUser){ //check for mainUser bec this is the user that update data of other
        if(err){
          return handleError(err);
        }
        //check if new username is provided
        if(newUsername){
          if(mainUser.permission === 'admin' || 'moderator'){
            User.findOne({_id: editUser}, function(err, user){ //check this user is the user that has been update by main user
              if(err){
                return handleError(err);
              } else {
                user.username = newUsername;
                user.save(function(err){
                  if(err){
                    handleError(err);
                  } else {
                    return res.json({success: true, message: 'Your new username have been update in our database :)'})
                  }
                })
              }
            })
          } else {
          return res.json({success: false, message: 'Your are Insufficience Permission!'})
          }
        }
        //check if new email is provided
        if(newEmail){
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            User.findOne({_id: editUser}, function(err, user){
              if(err){
                return handleError(err);
              } else {
                user.email = newEmail;
                user.save(function(err){
                  if(err){
                    return handleError(err);
                  } else {
                    return res.json({success: true, message: 'Your new E-mail have been update in our database :)'})
                  }
                })
              }
            })
          } else {
            return res.json({success: false, message: 'Your are Insufficience Permission!'})
          }
        }

        //check if new permission is provided
        if(newPermission){
          if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
            User.findOne({_id: editUser}, function(err, user){
                if(err){
                  return handleError(err);
                }
                else{
                      if(newPermission === 'user'){
                        if(user.permission === 'admin'){
                          if(mainUser.permission !== 'admin'){
                            return res.json({success: false, message: '1 Your are not an admin so you just can not downgrade '+user.username+' who is an admin! at least you neet to be in the same range.'})
                          } else {
                            user.permission = newPermission;
                            user.save(function(err){
                              if(err){
                                return handleError(err);
                              } else {
                                return res.json({success: true, message: '1 Oh! You are the admin and you just downgrade '+user.username+' who was an admin last moment to the user range'})
                              }
                            })
                          }
                        } else {
                          user.permission = newPermission;
                          user.save(function(err){
                            if(err){
                              console.log("Hello")
                              return handleError(err);
                            } else {
                               res.json({success: true, message: '1 You just downgrade '+user.username+' to be a USER in this project'})
                          }
                        })
                      }
                    }

                    if(newPermission === 'moderator'){
                      if(user.permission === 'admin'){
                        if(mainUser.permission !== 'admin'){
                          return res.json({success: false, message: '2 Your are not an admin so you just can not downgrade '+user.username+' who is an admin! at least you neet to be in the same range.'})
                        } else {
                          user.permission = newPermission;
                          user.save(function(err){
                            if(err){
                              return handleError(err);
                            } else {
                              return res.json({success: true, message: 'Oh! You are the admin and you just downgrade '+user.username+' who was an admin last moment to the MODERATOR range'})
                            }
                          })
                        }
                      } else {
                        user.permission = newPermission;
                        user.save(function(err){
                          if(err){
                            return handleError(err);
                          } else {
                            return res.json({success: true, message: '2 You just modify '+user.username+'  to be a MODERATOR in this project'})
                        }
                      })
                    }
                  }

                  if(newPermission === 'admin'){
                    console.log('mainUser here: ', mainUser.permission)
                    if(mainUser.permission !== 'admin') {
                      return res.json({success: false, message: '3 Your are not an admin so you just can not downgrade '+user.username+' who is an admin! at least you neet to be in the same range.'})
                    }else {
                      user.permission = newPermission;
                      user.save(function(err){
                        if(err){
                          return handleError(err);
                        } else {
                          return res.json({success: true, message: 'Oh! You are the admin and you just modify '+user.username+' account to be an ADMIN'})
                        }
                      })
                    }
                }
              }
            })
          }
        }
      })
    })

    //Adding tag route.
    router.post('/tagtypedata', function(req, res){
      var tagtype = new TagType();
      tagtype.tagname = req.body.tagname;
      if(tagtype.tagname == '' || tagtype.tagname == undefined){
        res.json({success: false, message: "You hasn't enter any tag"})
      } else {
        tagtype.save(function(err){
          if(err){
            return handleError(err);
          } else {
            res.json({success: true, message: 'Tag has been saved to the DB'});
          }
        })
      }
    })
    //list All tags
    router.get('/listalltags', function(req, res){
      TagType.find({}, function(err, tags){
        if(err){
          return handleError(err);
        }
        if(!tags){
          return res.json({success: false, message:'There is no tag yet'});
        }
         else {
          return res.json({success: true, tags: tags});
        }
      })
    })

    //create Status table
    router.post('/status', function (req, res) {
        var status = new Status();
        status.title = req.body.title;
        status.content = req.body.content;
        status.username = req.decoded.username;
        status.tags = req.body.colors;
        if(status.title=='' || status.title==undefined){
            res.json({success:false, message:'Please make sure title box is filled'})
        } if(status.tags==undefined){
          res.json({success:false, message:'Please select at least one tag'})
        }
         else {
            status.save(function (err, post) {
                if(err){
                    console.log(err);
                } else {
                    res.json({success:true, message:'You post a status!', statusid:post._id})
                }
            });
        }
    });

    //get data from status collection to show on index.html
    router.get('/status', function(req, res){
      Status.find({}, function(err, status){ //includes the findUser here to send profile user to the client also
        if(err){
          return handleError(err);
        }
        if(!status){
          return res.json({success: false, message: "Your token is expired please login again to see!"})
        }
        return res.json({success: true, status: status})
      }).sort({'_id': -1})
    })

//data
    router.get('/status1', function(req, res){
      console.log("the one ...")
      Status.find({}, function(err, status){ //includes the findUser here to send profile user to the client also
        if(err){
          return handleError(err);
        }
        if(!status){
          return res.json({success: false, message: "Your token is expired please login again to see!"})
        }
        return res.json({success: true, status: status})
      }).sort({'_id': -1})
    })

    //get Status for owner profile user
    router.get('/profile/:username', function(req, res){
      Status.find({username: req.params.username}, function(err, profile){
        if(err){
          return handleError(err);
        }
        if(!profile){
          return res.json({success: false, message: "Your token is expired please login again to see it!"})
        } else {
          User.findOne({username: req.params.username}, function(err, user){
            if(err){
              return handleError(err);
            } else {
              if(req.params.username === req.decoded.username){
                return res.json({success: true, profile: profile, profile_pic: user.profile, activeuser: true})
              } else {
                return res.json({success: true, profile: profile, profile_pic: user.profile, activeuser: false})
              }
            }
          })
        }
      })
    })

    //Show detail on one status for user discussion in talk.html
    router.get('/talk/:id', function(req, res){
      var talkID = req.params.id;
      Status.findOne({_id: talkID}, function(err, talk){
        if(err){
          handleError(err);
        } else {
          User.findOne({username: req.decoded.username}, function(err, user){
            if(err){
              return handleError(err)
            } else {
              if (talk.username === req.decoded.username){
                res.json({success: true, talk: talk, like: talk.totallike, enabledEdit: true, profile_pic: user.profile})
              } else { //check to increase for viewing
                currentView = talk.statusview;
                countView = currentView+1;
                Status.findOneAndUpdate({_id:talkID}, {statusview:countView}, {new:true}, function(err, updateView){
                  if(err){
                    throw err;
                  } else {
                    countView: updateView.statusview;
                  }
                })
                console.log('the views number is: ', countView)
                res.json({success: true, talk: talk, like: talk.totallike, enabledEdit: false, views: countView, profile_pic: user.profile})
              }
            }
          })
          }
      })
    })

    //Show detail on one status for user discussion in talk.html
    router.get('/refreshstatuswhenclicklike/:id', function(req, res){
      var talkID = req.params.id;
      Status.findOne({_id: talkID}, function(err, talk){
        if(err){
          handleError(err);
        } else {
            if (talk.username === req.decoded.username){
              res.json({success: true, talk: talk, like: talk.totallike, enabledEdit: true, usernameNow:req.decoded.username})
            } else { //check to increase for viewing
              res.json({success: true, talk: talk, like: talk.totallike, enabledEdit: false, usernameNow:req.decoded.username})
            }
          }
      })
    })

    //Post a comment by user in the talk page
    router.post('/comment/:id', function(req, res){
      if(req.body.comment === undefined || req.body.comment === ''){
        return res.json({success: false, message: 'Fill needed in the comment box'});
      } else {
        if(!req.params.id){
          res.json({success: false, message: 'No id provided'});
        } else {
          Status.findOne({_id: req.params.id}, function(err, status){
            if(err){
              return res.json({success: false, message: 'Invalid status id'});
            } else {
              if(!status){
                return res.json({success: false, message: 'Status not found.'});
              } else {
                User.findOne({username: req.decoded.username}, function(err, user){
                  if(err){
                    return res.json({success: false, message: 'Something wrong happen with your account. Please contact to the admin'})
                  } else {
                    if(!user){
                      return res.json("You need to register to our website first so that you can comment next time!");
                    } else {
                      status.totalcomment++;
                      status.comments.push({
                        comment: req.body.comment,
                        commentator: user.username,
                        profile: user.profile
                      })
                      status.save(function(err, cmmdata){
                        if(err){
                          return res.json({success: false, message: "Something when wrong when save data to the db"});
                        } else {
                          console.log("this is form of status: ", cmmdata)
                          return res.json({success: true, commentor:user.username, message: 'You post a comment!', numberOfComment:status.totalcomment})
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })

    //postSubComment by any user
    router.post('/subcomment/:id', function(req, res){
      if(req.body.subcomment === undefined || req.body.subcomment === ''){
        return res.json({success: false, message: 'Fill needed in the comment box'});
      } else {
        console.log('are you hear mr')

        if(!req.params.id){
          res.json({success: false, message: 'No id provided'});
        } else {
          Status.findOne({_id: req.params.id}, function(err, status){
            if(err){
              return res.json({success: false, message: 'Invalid status id'});
            } else {
              if(!status){
                return res.json({success: false, message: 'Status not found.'});
              } else {
                User.findOne({username: req.decoded.username}, function(err, user){
                  if(err){
                    return res.json({success: false, message: 'Something wrong happen with your account. Please contact to the admin'})
                  } else {
                    if(!user){
                      return res.json("You need to register to our website first so that you can comment next time!");
                    } else {
                      status.totalcomment++;
                      status.comments[req.body.indexOfMainComment].replies.push({
                        comment: req.body.subcomment,
                        commentator: user.username,
                        profile: user.profile
                      })
                      status.save(function(err, cmmdata){
                        if(err){
                          return res.json({success: false, message: "Something when wrong when save data to the db"});
                        } else {
                          console.log("this is form of status: ", cmmdata)
                          return res.json({success: true, commentor:user.username, message: 'You post a comment!', numberOfComment:status.totalcomment})
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })










      //   Status.findOne({_id: req.params.id}, function(err, status){
      //     if(err) throw err;
      //     else {
      //       currentTotal = status.totalcomment;
      //       countComment= currentTotal+1;
      //       console.log("currentTotal comment should: ", currentTotal)
      //       console.log("countComment should increase: ", countComment)
      //       Status.findOneAndUpdate({_id: req.params.id}, {totalcomment:countComment}, {new:true}, function(err, count){
      //         if(err) throw err;
              // else {
              //   console.log("what is count object: ", count)
              //   console.log("what is total comment now: ", count.totalcomment);
              // }

        //     })
        //   }
        // })
        // comment.save(function(err){
        //   if(err){
        //     return handleError(err);
        //   }
//data socket test
          // console.log('socket in route!', socket.id);
          // isocket.broadcast.emit('notification',{ notification: req.body.comment });
          // isocket.broadcast.to('y_oqXlAWP8Rc96JKAAAE').emit('notification', { notification: req.body.comment });
          // socket.on('notification', function(){})
          // socket.emit('notification',{ notification: req.body.comment });
          // console.log('the ::::', req.body.comment)

          //end socket test


    //route to get data of the comment on talk page back after comment and show it instantly
    router.get('/comment/:id', function(req, res){
      Status.find({_id: req.params.id}, function(err, comments){ //statusid is the id of the status in comment document
        if(err){
          return handleError(err);
        } else {
                  console.log('the data:', comments[0].comments)
                  return res.json({success: true,comments: comments[0].comments, activeuser: req.decoded.username});
        }
      })
    })

    //route to get data for update talk
    router.get('/updatetalk/:id', function(req, res){
      var talkID = req.params.id;
      Status.findOne({_id: talkID}, function(err, talk){
        if(err){
          return handleError(err);
        } else {
              if(talk.username === req.decoded.username){
                return res.json({success: true, talk: talk});
              } else {
                return res.json({success: false, message: "You are not the owner of this talk content!"})
              }
        }
      })
    })

    //route to update talk status
    router.put('/updatetalk', function(req, res){
      var talkID = req.body._id;
      Status.findOne({_id: talkID}, function(err, status){
        if(err){
          return handleError(err);
        } else {
          if(req.decoded.username === status.username){
            if(req.body.title !== undefined || req.body.title !== '' || req.body.title !== null){
              status.title = req.body.title;
              status.content = req.body.content;
              status.save(function(err){
                if(err){
                  return handleError(err);
                } else {
                  return res.json({success: true, message: 'Your new status is updated!'})
                }
              })
            } else {
              return res.json({success: false, message: 'Title of the content need to be filled'})
            }
          } else {
            return res.json({success: false, message: 'You are not authorized to be update this talk'})
          }
        }
      })
    })

    //Delete talk status
    router.delete('/deletetalk/:id', function(req, res){
      var deleteTalkID = req.params.id;
      var tokenUsername = req.decoded.username;
      Status.findOne({username: tokenUsername}, function(err, user){
        if(err){
          return handleError(err);
        } else {
              if(user.username === tokenUsername){
                Status.findOneAndRemove({_id: deleteTalkID}, function(err, status){
                  if(err){
                    return handleError(err);
                  } else {
                    return res.json({success: true, message: 'Status has been delete'})
                  }
                })
              }
              else return res.json({success: false, message: 'You are not the owner of this status'})
        }
      })
    })

//Like the content of talk.

  router.put('/liketalkcontent/:id', function(req, res){
    if(!req.params.id){
      return res.json({success: false, message: 'this status has been delete this moment by owner!'})
    } else {
      Status.findOne({_id: req.params.id}, function(err, status){
        if(err){
          return handleError(err); //res.json({success: false, message: 'Invalid blog id'});
        } else {
          if(!status){
            return res.json({success: false, message: 'The status just has been deleted this moment'})
          }
          else {
            User.findOne({username: req.decoded.username}, function(err, user){
              if(err){
                return handleError(err); //res.json({success: false, message: "Something wrong please contact to our admin"})
              } else {
                if(!user){
                  return res.json({success: false, message: "Seem you don't have acount yet. how could you try to vote"})
                } else {
                  if(status.likeby.includes(user.username)){
                    status.totallike--;
                    const arrayIndex = status.likeby.indexOf(user.username);
                    status.likeby.splice(arrayIndex, 1);
                    status.save(function(err){
                      if(err){
                        return res.json({success: false, message: 'Something wrong when you try to unlike it'})
                      } else {
                        return res.json({success: true, message: 'You have just change your mind to like it'});
                      }
                    })
                  } else {
                    status.totallike++;
                    console.log('the data of total like if have not liked yet: ', status.totallike)
                    console.log('the data of usernmae like if have not liked yet: ', user.username)

                    status.likeby.push(user.username);
                    console.log('the like by: ', status.likeby)
                    status.save(function(err){
                      if(err){
                        return handleError(err);
                        // return res.json({success: false, message: 'Something when wrong! please check your connection'})
                      } else {
                        return res.json({success: true, message: 'You just like this content'})
                      }
                    })
                  }
                }
              }
            })
          }
        }
      })
    }
  })

//Vote for Main Comment

  router.put('/votemaincomment', function(req, res){
    if(!req.body.maincommentid){
      return res.json({success: false, message: 'this comment has been delete this moment by owner!'})
    } else {
      Status.findOne({_id: req.body.statusid}, function(err, status){
        if(err){
          return handleError(err); //res.json({success: false, message: 'Invalid blog id'});
        } else {
          if(!status){
            return res.json({success: false, message: 'The status just has been deleted this moment'})
          }
          else {
            User.findOne({username: req.decoded.username}, function(err, user){
              if(err){
                return handleError(err); //res.json({success: false, message: "Something wrong please contact to our admin"})
              } else {
                if(!user){
                  return res.json({success: false, message: "Seem you don't have acount yet. how could you try to vote"})
                } else {
                  if(status.comments[req.body.indexOfComment].voteby.includes(user.username)){
                    status.comments[req.body.indexOfComment].vote--;
                    const arrayIndex = status.comments[req.body.indexOfComment].voteby.indexOf(user.username);
                    status.comments[req.body.indexOfComment].voteby.splice(arrayIndex, 1);
                    status.save(function(err){
                      if(err){
                        return res.json({success: false, message: 'Something wrong when you try to unvote it'})
                      } else {
                        return res.json({success: true, message: 'You have just change your mind to unvote it'});
                      }
                    })
                  } else {
                    status.comments[req.body.indexOfComment].vote++;
                    console.log('the data of vote if have not voted yet: ', status.comments[req.body.indexOfComment].vote)
                    console.log('the data of vote if have not voted yet: ', user.username)

                    status.comments[req.body.indexOfComment].voteby.push(user.username);
                    console.log('the vote by: ', status.comments[req.body.indexOfComment].voteby)
                    status.save(function(err){
                      if(err){
                        return handleError(err);
                        // return res.json({success: false, message: 'Something when wrong! please check your connection'})
                      } else {
                        return res.json({success: true, message: 'You voted this comment'})
                      }
                    })
                  }
                }
              }
            })
          }
        }
      })
    }
  })

//route for delete main comment in talk
router.put('/removemaincomment', function(req, res){
  if(!req.body.maincommentid){
    return res.json({success: false, message: 'this comment has been delete this moment by owner!'})
  } else {
    Status.findOne({_id: req.body.statusid}, function(err, status){
      if(err){
        return handleError(err); //res.json({success: false, message: 'Invalid blog id'});
      } else {
        if(!status){
          return res.json({success: false, message: 'The status just has been deleted this moment'})
        }
        else {
          User.findOne({username: req.decoded.username}, function(err, user){
            if(err){
              return handleError(err); //res.json({success: false, message: "Something wrong please contact to our admin"})
            } else {
              if(!user){
                return res.json({success: false, message: "Seem you don't have acount yet. how could you try to vote"})
              } else {
                console.log('id from collection here', status.comments[req.body.indexOfComment]._id)
                console.log('make id from select goes here', req.body.maincommentid)

                if(status.comments[req.body.indexOfComment]._id==req.body.maincommentid){
                  status.comments.splice(req.body.indexOfComment, 1);
                  console.log('make sure remove mainc goes here 222222222')

                  status.save(function(err){
                    if(err){
                      return res.json({success: false, message: 'Something wrong when you try to unvote it'})
                    } else {
                      return res.json({success: true, message: 'You have just change your mind to unvote it'});
                    }
                  })
                } else {
                  return res.json({success: true, message: 'You have alr delete this comment'});
                }
              }
            }
          })
        }
      }
    })
  }
})

//Vote for Sub Main Comment
router.put('/votesubmaincomment', function(req, res){
  if(!req.body.subcommentid){
    return res.json({success: false, message: 'this subcomment is already deleted'})
  } else {
    if(!req.body.maincommentid){
      return res.json({success: false, message: 'this comment has been delete this moment by owner!'})
    } else {
      Status.findOne({_id: req.body.statusid}, function(err, status){
        if(err){
          return handleError(err); //res.json({success: false, message: 'Invalid blog id'});
        } else {
          if(!status){
            return res.json({success: false, message: 'The status just has been deleted this moment'})
          }
          else {
            User.findOne({username: req.decoded.username}, function(err, user){
              if(err){
                return handleError(err); //res.json({success: false, message: "Something wrong please contact to our admin"})
              } else {
                if(!user){
                  return res.json({success: false, message: "Seem you don't have acount yet. how could you try to vote"})
                } else {
                  if(status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].voteby.includes(user.username)){
                    status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].vote--;
                    const arrayIndex = status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].voteby.indexOf(user.username);
                    status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].voteby.splice(arrayIndex, 1);
                    status.save(function(err){
                      if(err){
                        return res.json({success: false, message: 'Something wrong when you try to unvote it'})
                      } else {
                        return res.json({success: true, message: 'You have just change your mind to unvote it'});
                      }
                    })
                  } else {
                    status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].vote++;
                    console.log('the data of vote if have not voted yet: ', status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].vote)
                    console.log('the data of vote if have not voted yet: ', user.username)

                    status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].voteby.push(user.username);
                    console.log('the vote by: ', status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment].voteby)
                    status.save(function(err){
                      if(err){
                        return handleError(err);
                        // return res.json({success: false, message: 'Something when wrong! please check your connection'})
                      } else {
                        return res.json({success: true, message: 'You voted this comment'})
                      }
                    })
                  }
                }
              }
            })
          }
        }
      })
    }
  }
})

//route for Delete/Remove Sub Main Comment in talk
router.put('/removesubmaincomment', function(req, res){
  if(!req.body.subcommentid){
    return res.json({success: false, message: 'this subcomment was just deleted already'})
  } else {
    if(!req.body.maincommentid){
      return res.json({success: false, message: 'this comment has been delete this moment by owner!'})
    } else {
      Status.findOne({_id: req.body.statusid}, function(err, status){
        if(err){
          return handleError(err); //res.json({success: false, message: 'Invalid blog id'});
        } else {
          if(!status){
            return res.json({success: false, message: 'The status just has been deleted this moment'})
          }
          else {
            User.findOne({username: req.decoded.username}, function(err, user){
              if(err){
                return handleError(err); //res.json({success: false, message: "Something wrong please contact to our admin"})
              } else {
                if(!user){
                  return res.json({success: false, message: "Seem you don't have acount yet. how could you try to vote"})
                } else {
                  console.log('id from collection here', status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment]._id)
                  console.log('make id from select goes here', req.body.subcommentid)

                  if(status.comments[req.body.indexOfMainComment].replies[req.body.indexOfSubMainComment]._id==req.body.subcommentid){
                    status.comments[req.body.indexOfMainComment].replies.splice(req.body.indexOfSubMainComment, 1);
                    console.log('make sure remove mainc goes here 222222222')

                    status.save(function(err){
                      if(err){
                        return res.json({success: false, message: 'Something wrong when you try to unvote it'})
                      } else {
                        return res.json({success: true, message: 'You have just change your mind to unvote it'});
                      }
                    })
                  } else {
                    return res.json({success: true, message: 'You have alr delete this sub comment'});
                  }
                }
              }
            })
          }
        }
      })
    }
  }
})

//Post also and Update Profile Photo
router.post('/updateProfilePhoto', function(req, res){
  User.findOne({username: req.decoded.username}, function(err, user){
    if(req.body.profile && user){
      imageHelper.uploadBase64Image('./tmp/' +user.username + '_profile.jpg', req.body.profile, function(err, result){
          if(err) res.send(400, err);
          else{
            user.profile = String(result.url);
            user.save(function(err) {
              if(err) return validationError(res, err);
              return res.json({success: true})
            });
          }
        });
    }
  })
})

//try to create notification sys
router.post('/createnotification', function(req,res){//
  var ntf = new NTF();
  ntf.username = req.body.ownercontent;
  ntf.ntftext = req.body.guesttext;
  // ntf.toke  = req.body.token
  // ntf.username = req.body.username
  console.log('yal0000000000000000000: ',req.body.ownercontent)
  ntf.save(function(err){
    if(err){
      return handleError(err);
    } else {
      // this.sendRealTimeNotification(); //or
      // return global.activeSocketUser[token].emit('notification', notification);
      return res.json({success: true})
    }
  })

})

})// end of socketio

    return router;
};
