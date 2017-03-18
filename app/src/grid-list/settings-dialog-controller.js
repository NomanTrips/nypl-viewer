'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, lodash, DatabaseConnection, $q) {
    var ctrl = this;
    ctrl.readonly = false;
    ctrl.selectedItem = null;
    ctrl.searchText = null;
    //ctrl.querySearch = querySearch;
    ctrl.selectedInterests = [];
    ctrl.autocompleteDemoRequireMatch = true;
    //ctrl.transformChip = transformChip;
    ctrl.topics = [];

    ctrl.transformChip = function (chip) {
      // If it is an object, it's already a known chip
      if (angular.isObject(chip)) {
        return chip;
      }

      // Otherwise, create a new one
      return { name: chip, type: 'new' }
    }

    ctrl.getTopics = function () {
      var deferred = $q.defer();
      if (ctrl.topics.length == 0) {
        DatabaseConnection.getTopics().then(function (result) {
          console.log(result);
          ctrl.topics = result;
          deferred.resolve();
        })
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    ctrl.querySearch = function (query) {
      return ctrl.getTopics().then(function () {
        var results = query ? ctrl.topics.filter(ctrl.createFilterFor(query)) : [];
        return results;
      })

    }
    ctrl.createFilterFor = function (query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(topic) {
        return (topic.indexOf(lowercaseQuery) === 0) || (topic.indexOf(lowercaseQuery) === 0);
      };

    }
    /** 
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
    */
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