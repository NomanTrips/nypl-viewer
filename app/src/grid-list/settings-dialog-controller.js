'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, lodash, DatabaseConnection, $q, NyplApiCalls, $mdToast) {
    var ctrl = this;
    ctrl.readonly = false;
    ctrl.selectedItem = null;
    ctrl.searchText = '';
    ctrl.selectedInterests = [];
    ctrl.autocompleteDemoRequireMatch = true;
    ctrl.themes = [];
    ctrl.isResultsForNewThemeItem = false;
    ctrl.isSearchRun = false;
    ctrl.newThemeItemName = '';
    ctrl.newTopicResultCount = 0;


    ctrl.theme = {
      name: '',
      items: [
      ]
    };

    ctrl.newTheme = ctrl.theme;

    ctrl.newThemeItem = {
      search: '',
      page: 1,
      totalPages: null,
      isPageInfoRetrieved: false,
    };

    ctrl.getThemes = function () {
      var deferred = $q.defer();
      if (ctrl.themes.length == 0) {
        DatabaseConnection.getThemes().then(function (results) {
          //ctrl.topics = result;
          angular.forEach(results, function (theme) {
            ctrl.themes.push(theme);
          })
          deferred.resolve();
        })
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    ctrl.showToast = function (text) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(text)
          .position('top right')
          .hideDelay(1500)
      );
    };

    ctrl.isDuplicateObject = function (collectionToCheck, key, value) {
      return (lodash.find(collectionToCheck, function (obj) { return obj.topicName == value; }));
    }

    ctrl.isDuplicateArrayElement = function (array, value) {
      return (lodash.find(array, function (ele) { return ele == value; }) != undefined);
    }

    ctrl.addThemeItem = function () {
      if (!ctrl.isDuplicateObject(ctrl.newTheme.items, 'search', ctrl.newThemeItem)) {
        ctrl.newTheme.items.push(ctrl.newThemeItem);
        ctrl.newThemeItem = {
          search: '',
          page: 1,
          totalPages: null,
          isPageInfoRetrieved: false,
        };
        ctrl.isResultsForNewThemeItem = false;
        ctrl.isSearchRun = false;
      }
      else {
        ctrl.showToast('Theme item already in your theme!');
      }
    }

    ctrl.createTheme = function () {
      if (!ctrl.isDuplicateObject(ctrl.themes, 'name', ctrl.newTheme.name)) {
        var themeStr = angular.toJson(ctrl.newTheme);
        var themeJson = JSON.parse(themeStr); // Workaround to strip $$hash key from the properties
        DatabaseConnection.createTheme(themeJson);
        ctrl.showToast('Theme sucessfully created.');
      } else {
        ctrl.showToast('A theme with that name already exists!');
      }

    }

    ctrl.newThemeItemSearchChange = function () {
      ctrl.isSearchRun = false;
      ctrl.isResultsForNewThemeItem = false;
      if (ctrl.newThemeItem.search != '') {
        ctrl.isSearchRun = false;
        NyplApiCalls.nyplSearch(ctrl.newThemeItem.search, 1).then(function (results) {
          var numResults = results.data.nyplAPI.response.numResults;
          if (numResults > 0) {
            ctrl.newThemeItemResultCount = numResults;
            ctrl.isResultsForNewThemeItem = true;
          }
          ctrl.isSearchRun = true;
        })
      }
    }

    //ctrl.interests = [];
    //ctrl.interests = ['Steam engine', 'New York', 'Samurai', 'Dresses', 'Israel Putnam'];
    ctrl.initSelectedInterests = function () {
      DatabaseConnection.getSettings().then(function (settings) {
        ctrl.settings = settings;
        if (ctrl.settings == null) {
          ctrl.selectedInterests = [];
        } else {
          ctrl.selectedInterests = ctrl.settings.interests;
        }

      })
    }

    ctrl.selectedItemChange = function (item) {
      ctrl.theme = item;
    }

    ctrl.searchTextChange = function (searchText) {

    }

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      if (ctrl.theme != undefined) {
        DatabaseConnection.saveSettings({
          theme: ctrl.theme,
        }
        );
        $mdDialog.hide();
      } else {
        ctrl.showToast('No theme selected. Save failed!');
      }

    };

    DatabaseConnection.getSettings().then(function (settings) {
      ctrl.settings = settings;
      if (ctrl.settings == null) {
        console.log('No settings available  for this user!');
      } else {
        //ctrl.theme = ctrl.settings.theme;
      }
    })
    ctrl.getThemes();
    //ctrl.initSelectedInterests();

  });