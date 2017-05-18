
nyplViewer.controller('ImageViewerCtrl',
  function ($mdDialog, picInfo, picUrl, $http, lodash) {
    var ctrl = this;
    ctrl.detailUrl = picInfo.apiItemDetailURL;
    ctrl.picData = picInfo;
    ctrl.title = picInfo.title;
console.log(ctrl.picData);
    ctrl.file = picUrl;//fileInput;
    ctrl.options = {
      zoom: {
        value: 1.0,
        step: 0.10
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