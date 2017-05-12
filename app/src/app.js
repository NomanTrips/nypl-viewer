
var nyplViewer = angular.module('nyplViewer', [
  'ngMaterial',
  'base64',
  'ui.router',
  'ui.layout',
  'ui.tinymce',
  'infinite-scroll',
  'wu.masonry',
  'ngLodash',
  'firebase',
  'ngStorage',
  'ngMessages',
])
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 5000)
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');

    $stateProvider
      .state('main', {
        url: '/search?themeName&searchTerms',
        templateUrl: 'src/grid-list/main.html',
        controller: 'GridListCtrl',
        controllerAs: 'gridList',
        params: {
          themeName: {
            value: null,
            dynamic: true
          },
          searchTerms: {
            value: null,
            dynamic: true
          }

        },
        resolve: {
          // controller will not be loaded until $waitForSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function (Auth) {
            // $waitForSignIn returns a promise so the resolve waits for it to complete
            return Auth.authObj.$waitForSignIn();
          }]
        },
      })
      .state('image', {
        url: "/image/:id",
        templateUrl: 'src/image-viewer/viewer.html',
        controller: 'ImageViewerCtrl',
        controllerAs: 'imageViewer',
        params: { myParam: null },
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'src/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin',
        resolve: {
          // controller will not be loaded until $waitForSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function (Auth) {
            // $waitForSignIn returns a promise so the resolve waits for it to complete
            return Auth.authObj.$waitForSignIn();
          }]
        }
      });
  })
  .directive('stickyLoadingbar', function ($mdSticky, $compile) {
    var LOADINGBAR_TEMPLATE =
      '<div id="loadingbar" ng-hide="isloading" sticky>' +
      '<md-progress-linear md-mode="indeterminate" md-theme="dark-yellow"></md-progress-linear>' +
      '</div>';
    return {
      restrict: 'E',
      scope: {
        isloading: '='
      },
      replace: true,
      template: LOADINGBAR_TEMPLATE,
      link: function (scope, element) {
        $mdSticky(scope, element, $compile(LOADINGBAR_TEMPLATE)(scope));
      }
    };
  })
  .controller('ListBottomSheetCtrl', function ($scope, $mdBottomSheet) {

    $scope.items = [
      { name: 'Share', icon: 'share-arrow' },
      { name: 'Upload', icon: 'upload' },
      { name: 'Copy', icon: 'copy' },
      { name: 'Print this page', icon: 'print' },
    ];

    $scope.listItemClick = function ($index) {
      var clickedItem = $scope.items[$index];
      $mdBottomSheet.hide(clickedItem);
    };
  })
  .directive('panel1', function ($compile) {
       return {
           restrict: "E",
           transclude: true,
           replace: true,
           template: "<div id='wrappingDiv'></div>",
           link: function (scope, element, attr, ctrl, linker) {
               linker(function (clone) {
                   element.append(clone);
               });
           }
       }
   })
  .directive('picViewer', function ($compile, $timeout, $mdBottomSheet, $mdToast, $mdDialog, NyplApiCalls) {
    var pic_template =
      '<img class="image"  ng-click="showViewer()" ng-src="{{ pic.cropped }}" data-original="{{pic.fullImageUrl}}" alt="{{pic.title}}" pic-metadata="{{pic.data}}" style="width:280px;height:{{pic.actualHeight}};border-radius:10px;">';
    return {
      restrict: 'AE',
      //replace:true,
      //transclude: true,
      template: pic_template,
      scope: {
        pic: '=',
        picData: '=',
        detailurl: '='
      },
      link: function (scope, elem, attrs) {
        console.log(scope.pic);
        scope.theUrl = scope.pic.data.apiItemDetailURL;
        scope.isLoadingDone = false;
        scope.infoButtonText = 'Info';
        scope.metadata = {};
        scope.title;
        scope.names;
        scope.collection;
        //scope.startDate;
        //scope.endDate;
        scope.originInfo;
        scope.physicalDescription;
        scope.notes;
        scope.genres;
        scope.showMeta = false;
        scope.values = '';
        var dataObj;
        scope.apply = function (){
          console.log('running close');
    //scope.$apply();      
    scope.$digest();
        }
        scope.recursJsonPrint = function (obj) {
          for (var key in obj) {
            if (typeof (obj[key]) == 'object') {
              scope.recursJsonPrint(obj[key]);
            } else {
              if (key == '$') {
                scope.values = scope.values + (obj[key]) + ' ';
              }

              //alert("Key: " + key + " Values: " + obj[key]);
            }
          }
          return scope.values;
        }

        scope.showMetaData = function (picdataobj) {
                        var myEl = document.getElementsByClassName("detail-url");
              var wrappedResult = angular.element(myEl);
              console.log(wrappedResult);
          scope.showMeta = !scope.showMeta;
          if (scope.showMeta) {
            scope.infoButtonText = 'Hide info';
          } else {
            scope.infoButtonText = 'Info';
          }

          //console.log(scope.pic.data);
          if (scope.showMeta) {
            scope.isLoadingDone = false;
            NyplApiCalls.getDetail(wrappedResult.detailUrl).then(function (result) {
              scope.metadata = result.nyplAPI.response.mods;
              try {
                scope.title = scope.metadata.titleInfo.title.$;
              }
              catch (err) {
                scope.title = '';
              }
              try {

                scope.values = '';
                scope.subjectsStr = '';
                if (scope.metadata.hasOwnProperty('subject')) {
                  angular.forEach(scope.metadata.subject, function (subject) {
                    if (subject.hasOwnProperty('name')) {
                      scope.subjectsStr = scope.subjectsStr + 'Name: ' + subject.name.namePart.$ + ' ';
                    }

                    if (subject.hasOwnProperty('topic')) {
                      scope.subjectsStr = scope.subjectsStr + 'Topic: ' + subject.topic.$ + ' ';
                    }

                    if (subject.hasOwnProperty('geographic')) {
                      scope.subjectsStr = scope.subjectsStr + 'Geographic: ' + subject.geographic.$ + ' ';
                    }

                  })
                }

              }
              catch (err) {
                scope.subjectsStr = '';
              }
              try {
                scope.collection = scope.metadata.nyplAPI.response.mods.location[0].physicalLocation[2].$;
              }
              catch (err) {
                scope.collection = '';
              }
              try {
                scope.values = '';
                if (scope.metadata.hasOwnProperty('originInfo')) {
                  if (!Array.isArray(scope.metadata.originInfo)) {
                    if (scope.metadata.originInfo.hasOwnProperty('place')) {
                      scope.originInfoStr = 'Place: ' + scope.metadata.originInfo.place.placeTerm.$ + ' ';
                    }
                    if (scope.metadata.originInfo.hasOwnProperty('dateIssued')) {
                      scope.originInfoStr = 'Date issued: ' + scope.metadata.originInfo.dateIssued.$;
                    }
                    if (scope.metadata.originInfo.hasOwnProperty('dateCreated')) {
                      if (!Array.isArray(scope.metadata.originInfo.dateCreated)) {
                        scope.originInfoStr = 'Created date: ' + scope.metadata.originInfo.dateCreated.$ + ' ';
                      } else {
                        scope.originInfoStr = 'Created date: ';
                        angular.forEach(scope.metadata.originInfo.dateCreated, function (date) {
                          if (date.hasOwnProperty('qualifier')) {
                            scope.originInfoStr = scope.originInfoStr + date.qualifier + ' ';
                          }
                          if (date.hasOwnProperty('point')) {
                            scope.originInfoStr = scope.originInfoStr + date.point + ' ';
                          }
                          if (date.hasOwnProperty('$')) {
                            scope.originInfoStr = scope.originInfoStr + date.$ + ' ';
                          }

                        })

                      }

                    }
                  } else {
                    angular.forEach(scope.metadata.originInfo, function (originInfo) {
                      if (originInfo.hasOwnProperty('place')) {
                        scope.originInfoStr = 'Place: ' + originInfo.place.placeTerm.$ + ' ';
                      }
                      if (originInfo.hasOwnProperty('dateIssued')) {
                        scope.originInfoStr = 'Date issued: ' + originInfo.dateIssued.$;
                      }
                      if (originInfo.hasOwnProperty('dateCreated')) {
                        if (!Array.isArray(originInfo.dateCreated)) {
                          scope.originInfoStr = 'Created date: ' + originInfo.dateCreated.$ + ' ';
                        } else {
                          scope.originInfoStr = 'Created date: ';
                          angular.forEach(originInfo, function (date) {
                            if (date.hasOwnProperty('qualifier')) {
                              scope.originInfoStr = scope.originInfoStr + date.qualifier + ' ';
                            }
                            if (date.hasOwnProperty('point')) {
                              scope.originInfoStr = scope.originInfoStr + date.point + ' ';
                            }
                            if (date.hasOwnProperty('$')) {
                              scope.originInfoStr = scope.originInfoStr + date.$ + ' ';
                            }

                          })

                        }

                      }
                    })
                  }
                }

              }
              catch (err) {
                console.log(err);
                scope.originInfoStr = '';
              }
              try {
                scope.values = '';

                if (scope.metadata.hasOwnProperty('note')) {
                  scope.noteStr = '';
                  if (!Array.isArray(scope.metadata.note)) {
                    scope.noteStr = scope.metadata.note.$;
                  } else {
                    scope.noteStr = '';
                    angular.forEach(scope.metadata.note, function (note) {
                      if (note.hasOwnProperty('$')) {
                        scope.noteStr = scope.noteStr + note.$ + ', ';
                      }
                    })

                  }

                }
              }
              catch (err) {
                scope.noteStr = '';
              }
              try {
                if (scope.metadata.hasOwnProperty('genre')) {
                  scope.genreStr = '';
                  if (!Array.isArray(scope.metadata.genre)) {
                    scope.genreStr = scope.metadata.genre.$;
                  } else {
                    scope.genreStr = '';
                    angular.forEach(scope.metadata.genre, function (genre) {
                      if (genre.hasOwnProperty('$')) {
                        scope.genreStr = scope.genreStr + genre.$ + ', ';
                      }
                    })

                  }
                }
              }
              catch (err) {
                scope.genreStr = '';
              }

              scope.physicalDescription = '';
              scope.isLoadingDone = true;
            });
          }
        }

        scope.logThis = function () {
          console.log('king jubba');
        }
        scope.showViewer = function () {
         // dataObj = scope.pic.data;
          console.log(scope.pic.data.apiItemDetailURL);
         // scope.showMetaData(scope.pic.data);
          //console.log(scope.dataoriginal);
          var options = {
            //minHeight: 500,
            //minWidth: element.offsetWidth,
            detailUrl: scope.pic.data.apiItemDetailURL,
            url: 'data-original',
            inline: false,
            build: function (e) {
              // console.log(e.type);

              // ctrl.isViewerBuilt = false;
            },
            built: function (e) {
              //var myEl = angular.element(elem[0].querySelector('.viewer-container'));
              var myEl = document.getElementsByClassName("viewer-container");
              var wrappedResult = angular.element(myEl);
              /*
        $(".viewer-container").each(function () {
          console.log('running this');
          var content = $(this);
          angular.element(document).injector().invoke(function ($compile) {
            var viewerscope = angular.element(content).scope();
            $compile(content)(viewerscope);
          });
        });*/
              //$compile(wrappedResult)(scope);
          //var content = $(this);
          angular.element(myEl).injector().invoke(function ($compile) {
            var viewerscope = angular.element(myEl).scope();
           $compile(myEl)(viewerscope);
          });

              // ctrl.isViewerBuilt = true;
              scope.$apply();
              //scope.$digest();
            },
            hide: function (e){
              var myEl = document.getElementsByClassName("info-card");
              var wrappedResult = angular.element(myEl);
              console.log(wrappedResult);
              wrappedResult.remove();
              //console.log('running this');
              //scope.$apply();
             // scope.$digest();
            }
          };

          $('.image').viewer(options);

        }
        var viewer;

        // $compile(elem.viewer)(scope);
        //elem.viewer("shown", function () {
        //  console.log(this.viewer === viewer);
        //console.log('done building');
        //  $compile(this.viewer)(scope);
        //});
        
        //elem.bind('click', function () {
          //console.log('jubba');
          //showViewer();
       // });

      }
    };
  })
  .config(
  [
    '$mdIconProvider',
    '$mdThemingProvider',
    function ($mdIconProvider, $mdThemingProvider) {
      // Register the user `avatar` icons
      $mdIconProvider
        .defaultIconSet("./assets/svg/avatars.svg", 128)
        .icon("search", "./assets/svg/search.svg", 24)
        .icon("settings", "./assets/svg/settings.svg", 24)
        .icon("binoculars", "./assets/svg/binoculars.svg", 48)
        .icon("menu", "./assets/svg/menu.svg", 24)
        .icon("share", "./assets/svg/share.svg", 24)
        .icon("google_plus", "./assets/svg/google_plus.svg", 24)
        .icon("hangouts", "./assets/svg/hangouts.svg", 24)
        .icon("twitter", "./assets/svg/twitter.svg", 24)
        .icon("pen", "./assets/svg/fountain-pen.svg", 24)
        .icon("open-book", "./assets/svg/open-book.svg", 24)
        .icon("google", "./assets/svg/google.svg", 24)
        .icon("account", "./assets/svg/account.svg", 24)
        .icon("sign-out", "./assets/svg/sign-out.svg", 24)
        .icon("add-new", "./assets/svg/add-new.svg", 24)
        .icon("add", "./assets/svg/add.svg", 24)
        .icon("edit", "./assets/svg/edit.svg", 24)
        .icon("delete", "./assets/svg/garbage.svg", 24)
        .icon("bookmark", "./assets/svg/bookmark.svg", 24)
        .icon("cancel", "./assets/svg/cancel.svg", 36)
        .icon("phone", "./assets/svg/phone.svg", 24);

      $mdThemingProvider.theme('default')
        .primaryPalette('grey', {
          'default': '400', // by default use shade 400 from the pink palette for primary intentions
          'hue-1': '200', // use shade 100 for the <code>md-hue-1</code> class
          'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
          'hue-3': '50' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('amber');



      $mdThemingProvider.theme('dark-yellow').primaryPalette('yellow', {
        'default': '700'
      });

      $mdThemingProvider.theme('light-grey').primaryPalette('grey', {
        'default': 'A100'
      });

      $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey')



    }
  ]
  );
