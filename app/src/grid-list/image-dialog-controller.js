'use strict';

nyplViewer.controller('ImageDialogCtrl',
  function ($mdDialog, event, tile) {
    var ctrl = this;
    ctrl.overlays = [{ x: 0, y: 0, w: 0, h: 0, color: '#00FF00' }];
    ctrl.options = {
      zoom: {
        value: 1,
        step: 0.1
      },
      rotate: {
        value: 90
      },
      controls: {
        fit: 'height'
      }
    };
    ctrl.imageUrl = tile.fullImageUrl;
    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

  });