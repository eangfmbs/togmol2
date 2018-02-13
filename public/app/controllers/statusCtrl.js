angular.module('statusController',['userServices','authServices'])
.controller('askCtrl', function(User, $scope, $timeout, $location){
  var app = this;
  app.arrTag = [];
  var postStatusObject = {};

  function grapAllShowTags(){ //is to show a tag for poster selecting when post a content
    User.showAllTag().then(function(data){
      console.log(data)
      if(data.data.success){
        app.AllTag = data.data.tags;
        app.AllTag.forEach(function(tag){
          app.arrTag.push(tag.tagname);
        })
        console.log('hello TAG', app.arrTag.join());
      } else {
        console.log('no tag to show!')
      }
    })
  }
  grapAllShowTags();

  app.disabled = undefined;
  app.searchEnabled = undefined;

  app.setInputFocus = function (){
    $scope.$broadcast('UiSelectDemo1');
  };

  app.enable = function() {
    app.disabled = false;
  };

  app.disable = function() {
    app.disabled = true;
  };

  app.enableSearch = function() {
    app.searchEnabled = true;
  };

  app.disableSearch = function() {
    app.searchEnabled = false;
  };

  app.clear = function() {
    app.person.selected = undefined;
    app.address.selected = undefined;
    app.country.selected = undefined;
  };

  app.someGroupFn = function (item){

    if (item.name[0] >= 'A' && item.name[0] <= 'M')
        return 'From A - M';

    if (item.name[0] >= 'N' && item.name[0] <= 'Z')
        return 'From N - Z';

  };

  app.firstLetterGroupFn = function (item){
      return item.name[0];
  };

  app.reverseOrderFilterFn = function(groups) {
    return groups.reverse();
  };

  app.personAsync = {selected : "wladimir@email.com"};
  app.peopleAsync = [];
  app.peopleObj = {
    '1' : { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
    '2' : { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
    '3' : { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
    '4' : { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
    '5' : { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
    '6' : { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
    '7' : { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
    '8' : { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
    '9' : { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
    '10' : { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
  };

  app.person = {};

  app.person.selectedValue = app.peopleObj[3];
  app.person.selectedSingle = 'Samantha';
  app.person.selectedSingleKey = '5';
  // To run the demos with a preselected person object, uncomment the line below.
  //app.person.selected = app.person.selectedValue;

  app.people = [
    { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
    { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
    { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
    { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
    { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
    { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
    { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
    { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
    { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
    { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
  ];

  app.availableColors = app.arrTag;

  app.singleDemo = {};
  app.singleDemo.color = '';
  app.multipleDemo = {};
  app.multipleDemo.colors = [];
  app.multipleDemo.colors2 = ['Blue','Red'];
  app.multipleDemo.selectedPeople = [app.people[5], app.people[4]];
  app.multipleDemo.selectedPeople2 = app.multipleDemo.selectedPeople;
  app.multipleDemo.selectedPeopleWithGroupBy = [app.people[8], app.people[6]];
  app.multipleDemo.selectedPeopleSimple = ['samantha@email.com','wladimir@email.com'];
  app.multipleDemo.removeSelectIsFalse = [app.people[2], app.people[0]];

  //post a status
  app.askQuestion = function(askData){
    console.log('askData: ', app.askData)
    User.postStatus(app.askData).then(function(data){
      if(data.data.success){
        // postStatusObject.statusid = data.data.statusid
        // postStatusObject.tags = app.askData.colors;
        // console.log('this is postStatusObject: ', postStatusObject);
        // User.insertTagsWhenPostQuestion(postStatusObject).then(function(data){
        //   if(data.data.success){
        //     console.log(data.data.message);
        //   } else {
        //     console.log(data.data.message)
        //   }
        // })

        $timeout(function(){
          $location.path('/');
        },0)
        app.successMsg = data.data.message;
      } else {
        app.errorMsg = data.data.message;
      }
    })
  }





  // .controller('AppCtrl', ['$scope','$timeout', function ($scope, $timeout) {
                $scope.content = 'Quill works'
                $scope.model = ''
                $scope.readOnly = false
                $scope.test = ''
                $scope.customOptions = [{
                  import: 'attributors/style/size',
                  whitelist: ['14', '16', '18', 'small', 'large', 'huge']
                }]
                $scope.customModules = {
                  toolbar: [
                    [{'size': [false, '14', '16', '18']}]
                  ]
                }
                $timeout(function () {
                  $scope.content += ' awsome!!!'
                }, 0)
                $scope.editorCreated = function (editor) {
                  console.log('editorCreated:',editor)
                }
                $scope.contentChanged = function (editor, html, text, delta, oldDelta, source) {
                  // console.log('contentChanged: ', editor, 'html: ', html, 'text:', text, 'delta: ', delta, 'oldDelta:', oldDelta, 'source:', source)
                }
                $scope.selectionChanged = function (editor, range, oldRange, source) {
                  // console.log('selectionChanged: ', editor, 'range: ', range, 'oldRange:', oldRange, 'source:', source)
                }
            //   }
            // ])






})

// .controller('homeCtrl', function(User, $timeout, $location){
//   var app = this;
  // User.getAllStatus().then(function(data){
  //   if(data.data.success){
  //     app.allStatus = data.data.status;
  //   } else {
  //     app.errorMsg = data.data.message;
  //   }
  // })
// })

.controller('profileCtrl', function($scope, User, $mdToast, ImageService, $timeout, $location){
  var app = this;
  User.getProfileStatus().then(function(data){
    if(data.data.success){
      console.log(data.data.profile)
      app.allStatus = data.data.profile;
    } else {
      app.errorMsg = data.data.message;
    }
  })

  // upload image

  $scope.loading = false;
  $scope.uploadPhoto = null;
  $scope.croppedPhoto = null;

  $scope.readFileImg = function(files){
  $scope.uploadPhoto = null;
  $scope.croppedPhoto = null;
  $scope.photo = null;

  if (files && files.length) { //this part is just pass a file and update a scope with a new file
    var readImgCallback = function(err, img){
      $scope.loading = false;
      if(err) return Toaster.toastErrorMessage($scope, err);

      $scope.$apply(function(){ //function to update the scope with new file when something change
        $scope.uploadPhoto = img;
      });
    };
    $scope.loading = true;

    ImageService.readImageFile(files[0], readImgCallback);
  }
};

$scope.upload = function () {
  if ($scope.croppedPhoto) {
    $scope.myphoto=$scope.croppedPhoto;
    $scope.photo=$scope.croppedPhoto;
    var objectCrop = {};
    objectCrop.profile = $scope.croppedPhoto;
    $scope.loading = true;
    console.log("the file is:", $scope.files.name)
    User.updateProfilePhoto(objectCrop).then(function(data){
      if(data.data.success){
        var toast = $mdToast.simple()
                .textContent('Photo saved')
                .action('OK')
                .highlightAction(true)
                .position('left');
                $mdToast.show(toast);
// or use the toast bellow
               //  $mdToast.show (
               //    $mdToast.simple()
               //    .textContent('Hello World!')
               //    .hideDelay(3000)
               // );
      } else {
        Toaster.toastErrorMessage($scope, 'Error saving photo.');
      }
    })
  }
  else {
    $scope.loading = false;
  }
};


//crop image
    // $scope.myImage='';
    // $scope.myCroppedImage='';
    //
    // var handleFileSelect=function(evt) {
    //   var file=evt.currentTarget.files[0];
    //   var reader = new FileReader();
    //   reader.onload = function (evt) {
    //     $scope.$apply(function($scope){
    //       $scope.myImage=evt.target.result;
    //     });
    //   };
    //   reader.readAsDataURL(file);
    // };
    // angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

})
.controller('updateTalkCtrl', function(User,$scope,$routeParams,$timeout,$location){
  var app = this;
  User.getData2UpdateStatusTalk($routeParams.id).then(function(data){
    if(data.data.success){
      $scope.talkTitle = data.data.talk.title;
      $scope.talkContent = data.data.talk.content;
    } else {
      app.errorMsg = data.data.message;
    }
  })

  app.updateTalk = function(talkTitle, talkContent){
    var objectUpdate4Talk = {};
    objectUpdate4Talk.title = talkTitle;
    objectUpdate4Talk.content = talkContent;
    objectUpdate4Talk._id = $routeParams.id;
    User.updateNewStatusTalk(objectUpdate4Talk).then(function(data){
      if(data.data.success){
        $timeout(function(){
          $location.path('/talk/'+$routeParams.id);
        },0)
      } else {
        app.errorMsg = data.data.message;
      }
    })
  }


})
// .controller('talkCtrl', ['Socialshare', function testController(Socialshare) {
//
//     Socialshare.share({
//       'provider': 'facebook',
//       'attrs': {
//         'socialshareUrl': 'http://720kb.net'
//       }
//     })
.controller('talkCtrl', function(User, Socket, $scope, $timeout, $location, $routeParams){

  var app = this;
  app.title = "Hello Eang";
  app.text = "Some content goes here!";
  app.errorMsg = false
  User.getDiscussion($routeParams.id).then(function(data){
    if(data.data.success){
      app.enabledEdit = data.data.enabledEdit;
      app.status = data.data.talk;
      $scope.userDecode = data.data.talk.username;
      console.log('this talk view is: ', data.data.views)
      console.log('this talk status is: ', $scope.userDecode)
      app.totallike = data.data.like;
    } else {
      app.enabledEdit = data.data.enabledEdit;
      app.errorMsg = true;
      app.errorMsg = data.data.message;
    }
  });

  // the params for FabOfAngularjsMaterial
      // this.topDirections = ['left', 'up'];
      // this.bottomDirections = ['down', 'right'];

      this.isOpen = false;
      this.isOpenOnMainComment = false;

      // this.availableModes = ['md-fling', 'md-scale'];
      this.selectedMode = 'md-scale';

      // this.availableDirections = ['up', 'down', 'left', 'right'];
      // this.selectedDirection = 'up';
  //handle with socket data from the server automatically

  // Socket.emit('notify', {});
  // Socket.on('notification', function(data){
  //   console.log('this is : ', data.notification);
  // })




  app.postComment = function(commentData){
    var objectComment = $routeParams.id;
    User.postComment(objectComment, app.commentData).then(function(data){
      if(data.data.success){
        console.log('this comment Data: ', data.data)
        loadComment();


        Socket.emit("add-user", {"username": data.data.commentor});


        var objectNTF = {};
        objectNTF.guesttext = 'guesttext';
        objectNTF.ownercontent = $scope.ownercontent;
        console.log('ownercontent', $scope.ownercontent)
        // User.notficationAlert(objectNTF).then(function(data){
        //   if(data.data.success){
        //     console.log('notficationAlert save!')
        //   }
        // })
      }
       else {
        app.errorMsg = data.data.message;
      }
    })
  }

  function loadComment(){
    app.arrVote = [];
    app.arrUnvote = [];
    app.freshcomment = false;
    User.getAllCommetInCurrentStatus($routeParams.id).then(function(data){
      if(data.data.success){
        app.allvotes = data.data.votes;
        app.allComments = data.data.comments;
        app.sign = data.data.sign;
        console.log('the sing: ', app.sign)
        console.log('the all comment are: ', app.allComments)
        app.userDecode = data.data.activeuser;
      }
    })
  }
  loadComment();

//like talk topic
    app.clickLikeTalk = function () {
      var hasLiked = false; //initial that user haven't like yet
      User.likeContent($routeParams.id).then(function(data){
        if(data.data.success){
          console.log("user just like/unlike the content");
          User.refreshWhenClickLike($routeParams.id).then(function(data){
            if(data.data.success){
              app.enabledEdit = data.data.enabledEdit;
              app.status = data.data.talk;
              app.userDecode = data.data.talk.username;
              app.totallike = data.data.like;
            } else {
              app.enabledEdit = data.data.enabledEdit;
              app.errorMsg = true;
              app.errorMsg = data.data.message;
            }
          });
        } else {
          console.log("got error from like system");
        }
      })
    }

    //like comment status
    app.clickVoteComment = function(commentID, indexComment){
      var objectComment = {};
      objectComment.statusid = $routeParams.id;
      objectComment.indexOfComment = indexComment;
      objectComment.maincommentid = commentID;
      console.log('this is Data from ui commen vote click: ',objectComment)

          User.voteMainComment(objectComment).then(function(data){
            if(data.data.success){
              loadComment();
            }
          })
    }

//for delete topic of talk
    app.deleteTalk = function(){
      app.errorMsg = false;
      User.deleteTalkStatus($routeParams.id).then(function(data){
        if(data.data.success){
          $timeout(function () {
            $location.path('/profile')
          }, 0);
        } else {
          app.errorMsg = data.data.message;
        }
      })
    }

    //delete comment
    app.deleteCommnet = function(commentID, indexMainComment){ //No User Put To remove the comment. because it in array.
      app.errorMsg = false;
      var objectMainComment = {};
      objectMainComment.statusid = $routeParams.id;
      objectMainComment.maincommentid = commentID;
      objectMainComment.indexOfComment = indexMainComment;
      User.removeMainComment(objectMainComment).then(function(data){
        if(data.data.success){
          $timeout(function(){
            $location.path('/')
          }, 0)
        } else {
          app.errorMsg = data.data.message;
        }
      })
    }

    //postSubComment
    app.postSubComment = function(commentData, indexOfMainComment){ //if commentData is an object we will use app.
      var statusID = $routeParams.id;
      console.log("index of main comment: ", indexOfMainComment)
      console.log("main comment: ", commentData)

      var objectForSubComment = {};
      objectForSubComment.subcomment = commentData;
      objectForSubComment.indexOfMainComment = indexOfMainComment;
      User.postSubComment(statusID, objectForSubComment).then(function(data){
        if(data.data.success){
          loadComment();
          console.log("you just post a new subcomment")
        }
      })
    }

  //vote for sub comment

      app.clickVoteSubComment = function(subcommentid, maincommentindex, maincommentid, subcommentindex){
        var objectForSubComment = {};
        objectForSubComment.subcommentid = subcommentid;
        objectForSubComment.indexOfSubMainComment = subcommentindex;
        objectForSubComment.indexOfMainComment = maincommentindex;
        objectForSubComment.maincommentid = maincommentid;
        objectForSubComment.statusid = $routeParams.id;
        User.voteOnSubComment(objectForSubComment).then(function(data){
          if(data.data.success){
            loadComment();
            console.log("You just vote the sub comment");
          } else {
            console.log("Got a problem when attemp to vote a subcomment")
          }
        })
      }

      //remove Sub Comment or Delete.
      app.removeSubCommnet = function(subcommentid, maincommentindex, maincommentid, subcommentindex){
        var objectForSubComment = {};
        objectForSubComment.subcommentid = subcommentid;
        objectForSubComment.indexOfSubMainComment = subcommentindex;
        objectForSubComment.indexOfMainComment = maincommentindex;
        objectForSubComment.maincommentid = maincommentid;
        objectForSubComment.statusid = $routeParams.id;
        User.removeSubCommnet(objectForSubComment).then(function(data){
          if(data.data.success){
            loadComment();
            console.info("Now you just remove your subcomment")
          } else {
            console.log("Got a problem when try to remove a subcomment.")
          }
        })
      }



})
.directive('showButton', ['webNotification', function (webNotification) {
    'use strict';

    return {
        restrict: 'C',
        scope: {
            notificationTitle: '=',
            notificationText: '='
        },
        link: function (scope, element) {
            element.on('click', function onClick() {
                webNotification.showNotification(scope.notificationTitle, {
                    body: scope.notificationText,
                    icon: 'https://tracker.moodle.org/secure/useravatar?size=small&avatarId=17380',
                    onClick: function onNotificationClicked() {
                        console.log('Notification clicked.');
                    },
                    autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
                }, function onShow(error, hide) {
                    if (error) {
                        window.alert('Unable to show notification: ' + error.message);
                    } else {
                        console.log('Notification Shown.');

                        setTimeout(function hideNotification() {
                            console.log('Hiding notification....');
                            hide(); //manually close the notification (you can skip this if you use the autoClose option)
                        }, 5000);
                    }
                });
            });
        }
    };
}])
