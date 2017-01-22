'use strict';

var nyplViewer = angular.module('nyplViewer', ['ngMaterial', 'base64', 'CanvasViewer', 'ui.router', 'ui.layout'])
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
        params: {myParam: null},
      });
  })
  .config(($mdIconProvider, $mdThemingProvider) => {
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
  });
