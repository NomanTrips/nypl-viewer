'use strict';

nyplViewer.factory('Auth', function (firebase, $firebaseAuth, $firebaseObject, lodash) {
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

    factory.getDefaultThemes = function () {
        var firebaseUser = factory.authObj.$getAuth();
        return firebase.database().ref("defaultThemes").once('value').then(function (snapshot) {
            //firebase.database().ref('themes').once('value').then(function (snapshot) {
            var themes = snapshot.val();
            return themes;
        })
    }

    factory.writeUserData = function (uid, displayName, email) {
        factory.getDefaultThemes().then(function (results) { // then get default themes
            var randomTheme = lodash.sample(results);
            firebase.database().ref('users/' + uid).set({
                name: displayName,
                email: email,
                themes: [],
                selectedTheme: randomTheme
            });
        })

    }

    //var rootRef = firebase.database().ref();
    factory.checkForFirstTime = function (uid) {

        firebase.database().ref('users').child(uid).once('value', function (snapshot) {
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
                    if (!factory.checkForFirstTime(uid)) {
                        var user = result.user;
                        var uid = user.uid;
                        var displayName = user.displayName;
                        var email = user.email;
                        factory.writeUserData(uid, displayName, email);
                    }
                    return result;
                    // ...
                }).catch(function (error) {
                    return error;
                });
            } else if (authMethod == 'Anonymous') {
                return firebase.auth().signInAnonymously().then(function (result) {
                    var uid = result.uid;
                    var displayName = result.displayName;
                    var email = result.email;
                    if (!factory.checkForFirstTime(uid)) {
                        var user = result.user;
                        factory.writeUserData(uid, displayName, email);
                    }
                    return result;
                })
                    .catch(function (error) {
                        // Handle Errors here.
                        console.log(error);
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        return error;
                        // ...
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
