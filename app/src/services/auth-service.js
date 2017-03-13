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

    var rootRef = firebase.database().ref();

    factory.isNew = function (uid) {
        var user = rootRef.child("users").child(uid);
        var obj = $firebaseObject(user);
        return obj.$loaded();
    }

    return {
        authenticate: function (authMethod) {
            if (authMethod == 'Google') {
                return factory.authObj.$signInWithPopup("google").then(function (authData) {
                    var isNew;
                    factory.isNew(authData.user.uid)
                        .then(function (data) {
                            console.log(data.$value); // true
                            if (typeof data.$value != 'undefined' && data.$value === null) {
                                isNew = true;
                            } else {
                                isNew = false;
                            }
                            if (authData && isNew) {
                                console.log('setting new');
                                rootRef.child("users").child(authData.user.uid).set({
                                    provider: authData.user.providerData[0].providerId,
                                    name: authData.user.displayName,
                                    settings: {
                                        interests: [
                                        ]
                                    }
                                    //some more user data
                                });

                            }
                        })
                        .catch(function (error) {
                            console.error("Error:", error);
                            isNew = false;

                        });

                })
            }
        },
        saveSettings: function (settingsData) {
            var firebaseUser = factory.authObj.$getAuth();
            rootRef.child("users").child(firebaseUser.uid).child("settings").set(settingsData);
        },
        getSettings: function () {
            var firebaseUser = factory.authObj.$getAuth();
            var settingsPath = rootRef.child("users").child(firebaseUser.uid).child("settings");
            var settingsObject = $firebaseObject(settingsPath);
            return settingsObject;
        },
        authObj: factory.authObj
    }
});