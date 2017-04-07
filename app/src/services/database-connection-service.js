'use strict';

nyplViewer.service('DatabaseConnection', function (FirebaseStorageModel, LocalStorageModel, Auth) {
    var service = this;

    return {
        deleteSelectedTheme: function (theme) {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                FirebaseStorageModel.deleteSelectedTheme(theme);
            } else { //update local storage
                LocalStorageModel.deleteSelectedTheme(theme);
            }
        },
        saveSelectedTheme: function (theme) {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                FirebaseStorageModel.saveSelectedTheme(theme);
            } else { //update local storage
                LocalStorageModel.saveSelectedTheme(theme);
            }
        },
        getUserInfo: function () {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                return FirebaseStorageModel.getUserInfo();
            } else { //update local storage
                return LocalStorageModel.getUserInfo();
            }
        },
        getThemes: function () {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                return FirebaseStorageModel.getThemes();
            } else { //update local storage
                return [];
            }
        },
        createTheme: function (theme) {
            if (Auth.authObj.$getAuth()) {  // update on firebase
                return FirebaseStorageModel.createTheme(theme);
            }
        },
    }
});