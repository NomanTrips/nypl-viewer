'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, Auth, lodash) {
    var ctrl = this;
    ctrl.interests = [];
    //ctrl.interests = ['Steam engine', 'New York', 'Samurai', 'Dresses', 'Israel Putnam'];
    Auth.getSettings().then(function (settings) {
      ctrl.settings = settings;
      ctrl.interests = ctrl.settings.interests;
    })

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      Auth.saveSettings({
        interests: ctrl.interests,
      }
      );
      $mdDialog.hide();
    };

  });