'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, lodash, DatabaseConnection) {
    var ctrl = this;
    ctrl.interests = [];
    //ctrl.interests = ['Steam engine', 'New York', 'Samurai', 'Dresses', 'Israel Putnam'];
    DatabaseConnection.getSettings().then(function (settings) {
      ctrl.settings = settings;
      if (ctrl.settings == null) {
        ctrl.interests = [];
      } else {
        ctrl.interests = ctrl.settings.interests;
      }

    })

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      DatabaseConnection.saveSettings({
        interests: ctrl.interests,
      }
      );
      $mdDialog.hide();
    };

  });