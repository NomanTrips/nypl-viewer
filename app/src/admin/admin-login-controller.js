'use strict';

nyplViewer.controller('AdminLoginCtrl',
  function (Auth, $mdToast) {
    var ctrl = this;
    ctrl.username = '';
    ctrl.password = '';
    ctrl.login = function(){
      Auth.isLoggedInAdmin(ctrl.username, ctrl.password);
    }
  });