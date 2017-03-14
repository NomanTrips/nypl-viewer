'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, Auth) {
    var ctrl = this;
    //ctrl.interests = ['Steam engine', 'New York', 'Samurai', 'Dresses', 'Israel Putnam'];
    ctrl.interests = Auth.getSettings();
    
    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      Auth.saveSettings(ctrl.interests);
      $mdDialog.hide();
    };

  });