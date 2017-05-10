
nyplViewer.controller('ImageViewerCtrl',
  function ($mdDialog, picInfo, picUrl, $http, lodash) {
    var ctrl = this;
    ctrl.detailUrl = picInfo.apiItemDetailURL;
    ctrl.picData = picInfo;
    console.log(ctrl.detailUrl);
    ctrl.title = picInfo.title;
    ctrl.img = new Image();
    ctrl.overlays = [{ x: 50, y: 155, w: 106, h: 29, color: '#00FF00' }];

    ctrl.file = picUrl;//fileInput;
    ctrl.options = {
      zoom: {
        value: 1.0,
        step: 0.15
      },
      rotate: {
        value: 90
      },
      //controls : {
      //fit : 'height'
      //}
    };

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

  });