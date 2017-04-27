'use strict';

nyplViewer.factory('FirebaseStorageModel', function (firebase, Auth, $q) {
    var factory = this;

    return {
        deleteSelectedTheme: function (theme) {
            console.log(theme);
            var firebaseUser = Auth.authObj.$getAuth();
            firebase.database().ref('users').child(firebaseUser.uid).child("themes").child(theme.id).remove();
        },
        saveSelectedTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            firebase.database().ref('users').child(firebaseUser.uid).child("selectedTheme").set(theme);
            //some more user data      
        },
        getUserInfo: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref('users').child(firebaseUser.uid).once('value').then(function (snapshot) {
                var user = snapshot.val();
                return user;
            })
        },
        getThemes: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref('users').child(firebaseUser.uid).child("themes").once('value').then(function (snapshot) {
                //firebase.database().ref('themes').once('value').then(function (snapshot) {
                var themes = snapshot.val();
                return themes;
            })
        },
        getSubmittedThemes: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref("submittedThemes").once('value').then(function (snapshot) {
                //firebase.database().ref('themes').once('value').then(function (snapshot) {
                var getSubmittedThemes = snapshot.val();
                return getSubmittedThemes;
            })
        },
        getDefaultThemes: function () {
            var firebaseUser = Auth.authObj.$getAuth();
            return firebase.database().ref("defaultThemes").once('value').then(function (snapshot) {
                //firebase.database().ref('themes').once('value').then(function (snapshot) {
                var themes = snapshot.val();
                return themes;
            })
        },
        createTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            var themesRef = firebase.database().ref('users').child(firebaseUser.uid).child("themes").push();
            themesRef.set(theme);

            var submittedThemesRef = firebase.database().ref("submittedThemes").push();
            submittedThemesRef.set(theme);
            //some more user data      
        },
        createDefaultTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            var themesRef = firebase.database().ref("defaultThemes").push();
            themesRef.set(theme);
            //some more user data      
        },
        deleteSubmittedTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            firebase.database().ref("submittedThemes").child(theme.id).remove();
        },
        editDefaultTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            var id = theme.id;
            delete theme.id;
            firebase.database().ref("defaultThemes").child(id).set(theme);
        },
        editTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            var id = theme.id;
            delete theme.id;
            firebase.database().ref('users').child(firebaseUser.uid).child("themes").child(id).set(theme);
        },
    }
});