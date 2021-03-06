nyplViewer.factory('NyplApiCalls', function ($http, $q, $base64, lodash) {
    var factory = this;
    factory.page = 1;
    factory.resultCount = 0;
    var headers = {};

    function buildHttpRequest(url) {
        return {
            method: 'GET',
            url: url,
        }
    };

    function extract(result) {
        //console.log(result);
        if (result.data === undefined) {
            return [];
        } else {
            return result.data.nyplAPI.response.result;
        }
    }

    factory.incrementResultPage = function () {
        factory.page = factory.page + 1;
        //factory.resultCount = response.data.nyplAPI.response.numResults;
    }

    return {
        nyplSearch: function (searchText, page, filter) {
            var searchFilter ='';
            switch (filter) {
                case 'All':
                    searchFilter = "";
                    break;
                case 'Topic':
                    searchFilter = "&field=topic";
                    break;
                case 'Title':
                    searchFilter = "&field=title";
                    break;
                case 'Geographic':
                    searchFilter = "&field=geographic";
                    break;
            }
            //console.log(searchText);
            var pagingQueryParam = '';
            pagingQueryParam = '&page=' + page;
            //var nyplUrl = 'http://api.repo.nypl.org/api/v1/items/search?q=' + searchText  + pagingQueryParam + '&per_page=20'; //+'&field=topic';
            //var nyplUrl = 'http://localhost:80/api/v1/items/search?q=' + searchText + pagingQueryParam + '&per_page=20' + searchFilter; // dev
            //var nyplUrl = 'http://54.70.21.3:3000/api/v1/items/search?q=' + searchText  + pagingQueryParam + '&per_page=20' + searchFilter; // prod
            var nyplUrl = 'http://history-monocular.com:80/api/v1/items/search?q=' + searchText  + pagingQueryParam + '&per_page=20' + searchFilter; // prod w domain
            //factory.incrementResultPage();
            var deferred = $q.defer();
            var request = $http(buildHttpRequest(nyplUrl), { headers: headers });

            /** 
            .then(function successCallback(response) {       
                deferred.resolve(extract(response));
            }, function errorCallback(response) {
                deferred.reject(response);
            });
            */
            //return deferred.promise;
            return request;
        },
        getImage: function (item) {
            //console.log(item.title);
            var deferred = $q.defer();

            $http(buildHttpRequest(item.apiItemDetailURL), { headers: headers }).then(function successCallback(response) {
                var data = response.data;
                var image = {};
                if ((data.nyplAPI.response.sibling_captures.capture.imageLinks != undefined) &&
                    (data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink != undefined) &&
                    (Object.keys(data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink).length != 0)) {
                    image.thumbnailUrl = data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink[4].$;
                    image.fullImageUrl = data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink[0].$;
                    image.title = item.title;
                } else if ((data.nyplAPI.response.sibling_captures.capture[0] != undefined) &&
                    (data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink != undefined) &&
                    (Object.keys(data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink).length != 0)) {
                    image.thumbnailUrl = data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink[4].$;
                    image.fullImageUrl = data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink[0].$;
                    image.title = item.title;
                } else {
                    console.log('setting undefined');
                    image = undefined;
                }
                /*
                $http(buildHttpRequest(thumbnailUrl), { headers: headers }).then(function successCallback(response) {
                    console.log(response);
                    deferred.resolve(response);
                }, function errorCallback(response) {
                    deferred.reject(response);
                });
                
*/              //console.log(thumbnailUrl);
                deferred.resolve(image);
            }, function errorCallback(response) {
                console.log('error in servive');
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getDetail: function (item) {
            var deferred = $q.defer();
            //var nyplUrl = 'http://localhost:80/api/' + lodash.trim(item, 'http://api.repo.nypl.org'); //dev
            //var nyplUrl = 'http://54.70.21.3:3000/api/' + lodash.trim(item, 'http://api.repo.nypl.org'); // prod
            var nyplUrl = 'http://history-monocular.com:80/api/' + lodash.trim(item, 'http://api.repo.nypl.org'); // prod w domain

            $http(buildHttpRequest(nyplUrl), { headers: headers }).then(function successCallback(response) {
                var data = response.data;
                deferred.resolve(data);
            }, function errorCallback(response) {
                console.log('error in service');
                deferred.reject(response);
            });
            return deferred.promise;
        },
    }
});