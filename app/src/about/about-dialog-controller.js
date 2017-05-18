'use strict';

nyplViewer.controller('AboutDialogCtrl',
  function ($mdDialog) {
    var ctrl = this;

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {

    };


  });