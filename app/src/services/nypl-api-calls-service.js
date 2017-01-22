nyplViewer.factory('NyplApiCalls', function ($http, $q, $base64) {
    var factory = this;
    var auth = $base64.encode("NomanTrips:water1bury");
    var headers = { "Authorization": "Token " + "token=\"" + auth + "\"" };
    //console.log(headers);
    function buildHttpRequest(url) {
        //console.log(url);
        return {
            method: 'GET',
            url: url,
            headers: {
                'Authorization': 'Basic ' + auth
            }
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

    return {
        nyplSearch: function (year) {
            var nyplUrl = 'http://api.repo.nypl.org/api/v1/items/search?q=new york city ' + year +'&publicDomainOnly=true';
            var deferred = $q.defer();
            $http(buildHttpRequest(nyplUrl), { headers: headers }).then(function successCallback(response) {
                deferred.resolve(extract(response));
            }, function errorCallback(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getImage: function (item) {
            var deferred = $q.defer();
            $http(buildHttpRequest(item.apiItemDetailURL), { headers: headers }).then(function successCallback(response) {
                //console.log(response);
                var data = response.data;
                //console.log(data);
                if (data.nyplAPI.response.sibling_captures.capture.imageLinks != undefined) {
                    var thumbnailUrl = data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink[4].$;
                    var fullImageUrl = data.nyplAPI.response.sibling_captures.capture.imageLinks.imageLink[0].$;
                } else {
                    var thumbnailUrl = data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink[4].$;
                    var fullImageUrl = data.nyplAPI.response.sibling_captures.capture[0].imageLinks.imageLink[0].$;
                }
                item.fullImageUrl = fullImageUrl;
                item.thumbnailUrl = thumbnailUrl;
                /*
                $http(buildHttpRequest(thumbnailUrl), { headers: headers }).then(function successCallback(response) {
                    console.log(response);
                    deferred.resolve(response);
                }, function errorCallback(response) {
                    deferred.reject(response);
                });
                
*/              //console.log(thumbnailUrl);
                deferred.resolve(item);
            }, function errorCallback(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
    }
});