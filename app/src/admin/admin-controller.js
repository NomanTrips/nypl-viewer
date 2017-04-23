'use strict';

nyplViewer.controller('AdminCtrl',
  function ($mdDialog, lodash, DatabaseConnection, $mdToast, FirebaseStorageModel, $q, $scope) {
    var ctrl = this;
    ctrl.submittedThemes = [];

    ctrl.getSubmittedThemes = function () {

      FirebaseStorageModel.getSubmittedThemes().then(function (results) {
      //ctrl.submittedThemes = [];
        lodash.forEach(results, function (value, key) {
          value['id'] = key
          value['submitted'] = false;
          ctrl.submittedThemes.push(value);
        })
      $scope.$apply();
      })

    }
    ctrl.addToDefaults = function () {
      angular.forEach(ctrl.submittedThemes, function (theme) {
        if (theme.submitted == true) {
          var themeStr = angular.toJson(theme);
          var themeJson = JSON.parse(themeStr); // Workaround to strip $$hash key from the properties
          FirebaseStorageModel.createDefaultTheme(themeJson);
          FirebaseStorageModel.deleteSubmittedTheme(themeJson);
        }
      })
      ctrl.showToast(ctrl.submittedThemes.length + ' themes added to defaults.');
      ctrl.getSubmittedThemes();

    }

    ctrl.showToast = function (text) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(text)
          .position('top right')
          .hideDelay(1500)
      );
    };

    ctrl.deleteTheme = function (theme) {
      FirebaseStorageModel.deleteSubmittedTheme(theme);
      ctrl.showToast('Theme removed from submitted queue.');
    }

    ctrl.editTheme = function () {

    }
    ctrl.getSubmittedThemes();
  });