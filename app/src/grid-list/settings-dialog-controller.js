'use strict';

nyplViewer.controller('SettingsDialogCtrl',
  function ($mdDialog, lodash, DatabaseConnection, $q, NyplApiCalls, $mdToast) {
    var ctrl = this;
    ctrl.readonly = false;
    ctrl.selectedItem = null;
    ctrl.searchText = null;
    ctrl.selectedInterests = [];
    ctrl.autocompleteDemoRequireMatch = true;
    ctrl.topics = [];
    ctrl.isResultsForNewTopic = false;
    ctrl.isSearchRun = false;
    ctrl.newTopicName = '';
    ctrl.newTopicResultCount = 0;

    ctrl.getTopics = function () {
      var deferred = $q.defer();

      if (ctrl.topics.length == 0) {
        DatabaseConnection.getTopics().then(function (result) {
          //ctrl.topics = result;
          angular.forEach(result, function (topic) {
            ctrl.topics.push(topic);
          })
          deferred.resolve();
        })
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    ctrl.querySearch = function (query) {
        var results = query ? ctrl.topics.filter(ctrl.createFilterFor(query)) : [];
        return results;
    }

    ctrl.createFilterFor = function (query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(topic) {
        return (topic.topicName.indexOf(lowercaseQuery) === 0) || (topic.topicName.indexOf(lowercaseQuery) === 0);
      };

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
      return ( lodash.find(collectionToCheck, function(obj) { return obj.topicName == value; }) );
    }

    ctrl.isDuplicateArrayElement = function (array, value) {
      return (lodash.find(array, function(ele) { return ele == value; }) != undefined);
    }

    ctrl.addTopic = function () {
      if (! ctrl.isDuplicateArrayElement(ctrl.selectedInterests, ctrl.newTopicName)) {
        ctrl.selectedInterests.push(ctrl.newTopicName);
        ctrl.isResultsForNewTopic = false;
        ctrl.isSearchRun = false;
        if (! ctrl.isDuplicateObject(ctrl.topics, 'topicName', ctrl.newTopicName)) { // topic not in the firebase master list, add it
          DatabaseConnection.addTopic(ctrl.newTopicName);
          ctrl.showToast('Topic sucessfully created.');
        }
        ctrl.newTopicName = '';
      } else {
        ctrl.showToast('Topic already in your Interests!');
      }

    }

    ctrl.newTopicSearchChange = function () {
      ctrl.isSearchRun = false;
      ctrl.isResultsForNewTopic = false;
      if (ctrl.newTopicName != '') {
        ctrl.isSearchRun = false;
        NyplApiCalls.nyplSearch(ctrl.newTopicName, 1).then(function (results) {
          var numResults = results.data.nyplAPI.response.numResults;
          if (numResults > 0) {
            ctrl.newTopicResultCount = numResults;
            ctrl.isResultsForNewTopic = true;
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

    ctrl.hide = function () {
      $mdDialog.hide();
    };

    ctrl.cancel = function () {
      $mdDialog.hide();
    };

    ctrl.save = function () {
      DatabaseConnection.saveSettings({
        interests: ctrl.selectedInterests,
      }
      );
      $mdDialog.hide();
    };

    ctrl.getTopics();
    ctrl.initSelectedInterests();

  });