
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
  .directive('picViewer', function ($compile, $timeout, $mdBottomSheet, $mdToast, $mdDialog, NyplApiCalls) {
    return {
      restrict: 'AE',
      scope: {
        dataoriginal: '=',
      },
      link: function (scope, elem, attrs) {
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
        
        scope.recursJsonPrint = function (obj) {
          for (var key in obj) {
            if (typeof (obj[key]) == 'object') {
              scope.recursJsonPrint(obj[key]);
            } else {
              if (key == '$'){
                scope.values = scope.values + (obj[key]) +' ';
              }

              //alert("Key: " + key + " Values: " + obj[key]);
            }
          }
          return scope.values;
        }

        scope.showMetaData = function () {
          console.log(JSON.parse(attrs.picMetadata));
          NyplApiCalls.getDetail(JSON.parse(attrs.picMetadata)).then(function (result) {
            scope.metadata = result;
            try {
              scope.title = scope.metadata.nyplAPI.response.mods.titleInfo.title.$;
            }
            catch (err) {
              scope.title = '';
            }
            try {
              scope.names = scope.metadata.nyplAPI.response.mods.subject[0].name.namePart.$;
            }
            catch (err) {
              scope.names = '';
            }
            try {
              scope.collection = scope.metadata.nyplAPI.response.mods.location[0].physicalLocation[2].$;
            }
            catch (err) {
              scope.collection = '';
            }
            try {
              scope.values = '';
              scope.originInfo = scope.recursJsonPrint(scope.metadata.nyplAPI.response.mods.originInfo);
              //if (scope.metadata.nyplAPI.response.mods.originInfo.dateIssued.$ != undefined) {
              //  scope.startDate = scope.metadata.nyplAPI.response.mods.originInfo.dateIssued.$
             // } else if (scope.metadata.nyplAPI.response.mods.originInfo.dateCreated[0].$ != undefined) {
              //  scope.startDate = scope.metadata.nyplAPI.response.mods.originInfo.dateCreated[0].$;
              //}

            }
            catch (err) {
              console.log(err);
              scope.originInfo = '';
            }
            /*
            try {
              scope.endDate = scope.metadata.nyplAPI.response.mods.originInfo.dateCreated[1].$;
            }
            catch (err) {
              scope.endDate = '';
            }
            */
            try {
              scope.values = '';
              scope.notes = scope.recursJsonPrint(scope.metadata.nyplAPI.response.mods.note);
              //var notes = '';
              //angular.forEach(scope.metadata.nyplAPI.response.mods.note, function (note) {
                //notes = notes + '  ' + note.$;
              //})
             // scope.notes = notes;
            }
            catch (err) {
              scope.notes = '';
            }
            try {
              scope.values = '';
              scope.topics = scope.recursJsonPrint(scope.metadata.nyplAPI.response.mods.subject);
              //var topics = '';
              //angular.forEach(scope.metadata.nyplAPI.response.mods.subject, function (subject) {
              //  topics = topics + ',' + subject.topic.$;
              //})
              //scope.topics = topics;
            }
            catch (err) {
              scope.topics = '';
            }
            try {
              scope.values = '';
              scope.genres = scope.recursJsonPrint(scope.metadata.nyplAPI.response.mods.genre);
              //var genres = '';
              //angular.forEach(scope.metadata.nyplAPI.response.mods.genre, function (genre) {
               // genres = genres + ',' + genre.$;
              //})
              //scope.genres = genres;
            }
            catch (err) {
              scope.genres = '';
            }

            scope.physicalDescription = '';

          });

          scope.showMeta = !scope.showMeta;
        }

        scope.showListBottomSheet = function (ev) {
          console.log('firing bottom sheet');
          $mdDialog.show({
            controller: 'ListBottomSheetCtrl',
            templateUrl: 'src/grid-list/bottom-sheet-list-template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
          })
            .then(function (answer) {
              scope.status = 'You said the information was "' + answer + '".';
            }, function () {
              scope.status = 'You cancelled the dialog.';
            });
          /*
          scope.alert = '';
          $mdBottomSheet.show({
            templateUrl: 'src/grid-list/bottom-sheet-list-template.html',
            controller: 'ListBottomSheetCtrl'
          }).then(function (clickedItem) {
            scope.alert = clickedItem['name'] + ' clicked!';
          }).catch(function (error) {
            // User clicked outside or hit escape
          });
          */
        };

        scope.logThis = function () {
          console.log('king jubba');
        }
        var showViewer = function () {
          var options = {
            //minHeight: 500,
            //minWidth: element.offsetWidth,
            url: scope.original,
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
              console.log(wrappedResult);
              $compile(wrappedResult)(scope);

              // ctrl.isViewerBuilt = true;
              scope.$apply();
            },
          };

          $(elem).viewer(options);

        }
        var viewer;

        // $compile(elem.viewer)(scope);
        //elem.viewer("shown", function () {
        //  console.log(this.viewer === viewer);
        //console.log('done building');
        //  $compile(this.viewer)(scope);
        //});
        elem.bind('click', function () {
          console.log('jubba');
          showViewer();
        });

      }
    };
  })
  .controller('MyCtrl', function ($scope) {
    $scope.anyFunc = function (var1, var2) {
      alert("I am var1 = " + var1);
      alert("I am var2 = " + var2);
    }
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
        .icon("add", "./assets/svg/add.svg", 24)
        .icon("edit", "./assets/svg/edit.svg", 24)
        .icon("delete", "./assets/svg/delete.svg", 24)
        .icon("bookmark", "./assets/svg/bookmark.svg", 24)
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
