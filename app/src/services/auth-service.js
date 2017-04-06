'use strict';

nyplViewer.factory('Auth', function (firebase, $firebaseAuth, $firebaseObject) {
    var factory = this;

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB-Ye7lD1r4D8Dj2QI0Xqy3dOQUl7srC-w",
        authDomain: "monocular-d0cad.firebaseapp.com",
        databaseURL: "https://monocular-d0cad.firebaseio.com",
        storageBucket: "monocular-d0cad.appspot.com",
        messagingSenderId: "487697293908"
    };

    firebase.initializeApp(config);
    factory.authObj = $firebaseAuth();

    factory.writeUserData = function (userId, name, email) {
        firebase.database().ref('users/' + userId).set({
            name: name,
            email: email,
            themes: [],
            selectedTheme: {}
        });
    }

    //var rootRef = firebase.database().ref();
    factory.checkForFirstTime = function (userId) {
        firebase.database().ref('users').child(userId).once('value', function (snapshot) {
            var exists = (snapshot.val() !== null);
            if (exists) {
                return true;
            } else {
                return false;
            }
        });
    }

    return {
        authenticate: function (authMethod) {
            if (authMethod == 'Google') {
                return factory.authObj.$signInWithPopup("google").then(function (result) {
                    if (!factory.checkForFirstTime(result.user.uid)) {
                        var user = result.user;
                        factory.writeUserData(user.uid, user.displayName, user.email);
                    }
                    return result;
                    // ...
                }).catch(function (error) {
                    return error;
                });
            }
        },
        saveSettings: function (settingsData) {
            var firebaseUser = factory.authObj.$getAuth();
            firebase.database().ref('users').child(firebaseUser.uid).set({
                settings: settingsData,
            });
            //some more user data      
        },
        getSettings: function () {
            var firebaseUser = factory.authObj.$getAuth();
            return firebase.database().ref('users').child(firebaseUser.uid).child("settings").once('value').then(function (snapshot) {
                var settings = snapshot.val();
                return settings;
            })
        },
        authObj: factory.authObj
    }
});