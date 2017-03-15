'use strict';

nyplViewer.service('LocalStorageModel', function ($localStorage, $q) {
    var service = this;
    service.$storage = $localStorage;

    service.create = function () {
        service.$storage.user = 
            {
            name: 'defaultUser',
            email: '',
            settings: {
                interests: []
            },
        }
    }

    return {
        getSettings: function () {
            var deferred = $q.defer();
            if (service.$storage.userInfo == undefined) {
                service.create();
            }
            deferred.resolve(service.$storage.user.settings); 
            return deferred.promise;
        },
        saveSettings: function (settingsData) {
            service.$storage.user.settings = settingsData;
            //return service.$storage.user;
        }
    }

});