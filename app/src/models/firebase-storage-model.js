'use strict';

nyplViewer.factory('FirebaseStorageModel', function (firebase, Auth) {
    var factory = this;

    return {
        saveSettings: function (settingsData) {
            var firebaseUser = Auth.authObj.$getAuth();
            firebase.database().ref('users').child(firebaseUser.uid).set({
                settings: settingsData,
            });
            //some more user data      
        },
        getSettings: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref('users').child(firebaseUser.uid).child("settings").once('value').then(function (snapshot) {
                var settings = snapshot.val();
                return settings;
            })
        },
        getTopics: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref('topics').once('value').then(function (snapshot) {
                var topics = snapshot.val();
                return topics;
            })
        }
    }
});