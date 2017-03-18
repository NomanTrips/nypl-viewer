'use strict';

nyplViewer.service('DatabaseConnection', function (FirebaseStorageModel, LocalStorageModel, Auth) {
    var service = this;

    return {
        saveSettings: function (serverObj) {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                FirebaseStorageModel.saveSettings(serverObj);
            } else { //update local storage
                LocalStorageModel.saveSettings(serverObj);
            }
        },
        getSettings: function () {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                return FirebaseStorageModel.getSettings();
            } else { //update local storage
                return LocalStorageModel.getSettings();
            }
        },
        getTopics: function () {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                return FirebaseStorageModel.getTopics();
            } else { //update local storage
                return [];
            }
        },
    }
});