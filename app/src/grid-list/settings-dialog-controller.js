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
    ctrl.newThemeItemResultCount = 0;
    ctrl.isLoadingDone = true;

    ctrl.theme = undefined;

    ctrl.newTheme = {
      name: '',
      items: [
      ]
    };

    ctrl.newThemeItem = {
      search: '',
      page: 1,
      totalPages: 0,
      isPageInfoRetrieved: false,
    };

    ctrl.getThemes = function () {
      ctrl.themes = [];
      var deferred = $q.defer();
      DatabaseConnection.getThemes().then(function (results) {
        //ctrl.topics = result;
        angular.forEach(results, function (theme) {
          ctrl.themes.push(theme);
        })
        deferred.resolve();
      })
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
      console.log(lodash.find(collectionToCheck, function (obj) { return obj[key] == value; }));
      return (lodash.find(collectionToCheck, function (obj) { return obj[key] == value; }));
    }

    ctrl.isDuplicateArrayElement = function (array, value) {
      return (lodash.find(array, function (ele) { return ele == value; }) != undefined);
    }

    ctrl.addThemeItem = function () {
      if (!ctrl.isDuplicateObject(ctrl.newTheme.items, 'search', ctrl.newThemeItem.search)) {
        ctrl.newTheme.items.push(ctrl.newThemeItem);
        ctrl.newThemeItem = {
          search: '',
          page: 1,
          totalPages: 0,
          isPageInfoRetrieved: false,
        };
        ctrl.isSearchRun = false;
        ctrl.isResultsForNewThemeItem = false;
      }
      else {
        ctrl.showToast('Theme item already in your theme!');
      }
    }

    ctrl.createTheme = function () {
      if (ctrl.newTheme.name === '') {
        ctrl.showToast('Theme name not entered. Save failed!');
        return;
      }
      if (ctrl.newTheme.items.length < 1) {
        ctrl.showToast('No new theme items present. Save failed!');
        return;
      }
      if (ctrl.newTheme.items.length < 2) {
        ctrl.showToast('A new theme must have at lease 2 theme items. Save failed!');
        return;
      }
      if (!ctrl.isDuplicateObject(ctrl.themes, 'name', ctrl.newTheme.name)) {
        var themeStr = angular.toJson(ctrl.newTheme);
        var themeJson = JSON.parse(themeStr); // Workaround to strip $$hash key from the properties
        DatabaseConnection.createTheme(themeJson);
        ctrl.getThemes();
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
        ctrl.isLoadingDone = false;
        NyplApiCalls.nyplSearch(ctrl.newThemeItem.search, 1).then(function (results) {
          var numResults = results.data.nyplAPI.response.numResults;
          if (numResults > 0) {
            ctrl.newThemeItemResultCount = numResults;
            ctrl.isResultsForNewThemeItem = true;
          }
          ctrl.isLoadingDone = true;
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

    ctrl.loadSelectedTheme = function () {
      deferred = $q.defer();
      if (ctrl.theme != undefined) {
        deferred.resolve();
      } else {
        console.log('getting here');
        DatabaseConnection.getSettings().then(function (settings) {
          ctrl.settings = settings;
          if (ctrl.settings == null) {
            console.log('No settings available  for this user!');
          } else {
            ctrl.theme = ctrl.settings.theme;
            ctrl.searchText = ctrl.theme.name;
          }
          deferred.resolve();
        })
      }
      return deferred.promise;
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
      if (ctrl.theme != undefined && ctrl.selectedItem != null) {
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

    ctrl.loadSelectedTheme();
    ctrl.getThemes();
    //ctrl.initSelectedInterests();

  });