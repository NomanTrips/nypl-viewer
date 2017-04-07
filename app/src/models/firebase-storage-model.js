'use strict';

nyplViewer.factory('FirebaseStorageModel', function (firebase, Auth) {
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
                console.log(themes);
                return themes;
            })
        },
        createTheme: function (theme) {
            var firebaseUser = Auth.authObj.$getAuth();
            var themesRef = firebase.database().ref('users').child(firebaseUser.uid).child("themes").push();
            themesRef.set(theme);
            //some more user data      
        },
    }
});