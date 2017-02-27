
var nyplViewer = angular.module('nyplViewer', [
  'ngMaterial',
  'base64',
  'ui.router',
  'ui.layout',
  'ui.tinymce',
  'infinite-scroll',
  'wu.masonry',
])
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 5000)
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');

    $stateProvider
      .state('main', {
        url: '',
        templateUrl: 'src/grid-list/main.html',
        controller: 'GridListCtrl',
        controllerAs: 'gridList',
      })
      .state('image', {
        url: "/image/:id",
        templateUrl: 'src/image-viewer/viewer.html',
        controller: 'ImageViewerCtrl',
        controllerAs: 'imageViewer',
        params: { myParam: null },
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
        .icon("menu", "./assets/svg/menu.svg", 24)
        .icon("share", "./assets/svg/share.svg", 24)
        .icon("google_plus", "./assets/svg/google_plus.svg", 24)
        .icon("hangouts", "./assets/svg/hangouts.svg", 24)
        .icon("twitter", "./assets/svg/twitter.svg", 24)
        .icon("pen", "./assets/svg/fountain-pen.svg", 24)
        .icon("open-book", "./assets/svg/open-book.svg", 24)
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
