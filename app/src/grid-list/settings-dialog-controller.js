'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog) {
    var ctrl = this;
    ctrl.interests = ['Steam engine', 'New York', 'Samurai', 'Dresses', 'Israel Putnam'];

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      $mdDialog.hide();
    };

  });