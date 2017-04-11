'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, lodash, DatabaseConnection, $q, NyplApiCalls, $mdToast) {
    var ctrl = this;
    ctrl.readonly = false;
    ctrl.selectedItem = null;
    ctrl.searchText = '';
    ctrl.autocompleteDemoRequireMatch = true;
    ctrl.themes = [];
    ctrl.isResultsForNewThemeItem = false;
    ctrl.isSearchRun = false;
    ctrl.newThemeItemName = '';
    ctrl.newThemeItemResultCount = 0;
    ctrl.isLoadingDone = true;
    ctrl.isEditingTheme = false;
    ctrl.isNew = false;

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

    ctrl.addTheme = function (){
      ctrl.isNew = true;
    }

    ctrl.filter = function (searchStr) {
      var results = lodash.filter(ctrl.themes, function (theme) { return theme.name.indexOf(searchStr) > -1; });
      return results;
    }

    ctrl.getThemes = function () {
      ctrl.themes = [];
      var deferred = $q.defer();
      DatabaseConnection.getThemes().then(function (results) {
        lodash.forEach(results, function (value, key) {
          value['id'] = key
          ctrl.themes.push(value);
        });
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

    ctrl.saveTheme = function () {
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
      if (!ctrl.isDuplicateObject(ctrl.themes, 'name', ctrl.newTheme.name) || ctrl.isEditing) {
        var themeStr = angular.toJson(ctrl.newTheme);
        var themeJson = JSON.parse(themeStr); // Workaround to strip $$hash key from the properties
        if (ctrl.isEditing) {
          DatabaseConnection.editTheme(themeJson);
          ctrl.isEditing = false;
        } else {
          DatabaseConnection.createTheme(themeJson);
          ctrl.isNew = false;
        }
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
        ctrl.getThemes();
        ctrl.showToast('Theme sucessfully saved to favorites.');
      }
      else {
        ctrl.showToast('A theme with that name already exists in your favorites!');
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

    ctrl.loadSelectedTheme = function () {
      deferred = $q.defer();
      if (ctrl.theme != undefined) {
        deferred.resolve();
      } else {
        DatabaseConnection.getUserInfo().then(function (user) {
          if (user.selectedTheme == null) {
            console.log('No selected theme for this user!');
          } else {
            ctrl.theme = user.selectedTheme;
            ctrl.searchText = ctrl.theme.name;
          }
          deferred.resolve();
        })
      }
      return deferred.promise;
    }

    ctrl.editTheme = function () {
      if (ctrl.theme != undefined) {
        ctrl.newTheme = ctrl.theme;
        ctrl.isEditing = true;
      }
    }

    ctrl.deleteTheme = function () {
      if (ctrl.theme != undefined) {
        DatabaseConnection.deleteSelectedTheme(ctrl.theme);
        ctrl.showToast('Theme deleted.');
      }
    }

    ctrl.selectedItemChange = function (value) {
      ctrl.theme = value;
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
        DatabaseConnection.saveSelectedTheme(ctrl.theme);
        $mdDialog.hide();
      } else {
        ctrl.showToast('No theme selected. Save failed!');
      }

    };

    ctrl.loadSelectedTheme();
    ctrl.getThemes();

  });