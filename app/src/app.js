
var nyplViewer = angular.module('nyplViewer', ['ngMaterial', 'base64', 'ui.router', 'ui.layout', 'ui.tinymce', 'infinite-scroll', 'wu.masonry'])
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
  .config(
  [
    '$mdIconProvider',
    '$mdThemingProvider',
    function ($mdIconProvider, $mdThemingProvider) {
      // Register the user `avatar` icons
      $mdIconProvider
        .defaultIconSet("./assets/svg/avatars.svg", 128)
        .icon("menu", "./assets/svg/menu.svg", 24)
        .icon("share", "./assets/svg/share.svg", 24)
        .icon("google_plus", "./assets/svg/google_plus.svg", 24)
        .icon("hangouts", "./assets/svg/hangouts.svg", 24)
        .icon("twitter", "./assets/svg/twitter.svg", 24)
        .icon("pen", "./assets/svg/fountain-pen.svg", 24)
        .icon("open-book", "./assets/svg/open-book.svg", 24)
        .icon("phone", "./assets/svg/phone.svg", 24);

      $mdThemingProvider.theme('default')
        .primaryPalette('brown')
        .accentPalette('red');
    }
  ]
  );
