nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, $mdMedia, $mdDialog, lodash, $mdToast, Auth) {

    ctrl = this;
    ctrl.searchText = 'new york city 1776';
    ctrl.pics = [];
    ctrl.searchPage = 0;
    ctrl.isLoadingDone = true;
    ctrl.isSearchByInterestsModeOn = true;
    ctrl.modeDescription = 'Shuffle'
    ctrl.isPageInfoRetrieved = false;
    ctrl.isMoreSearchItems = true;
    ctrl.interestSearches = [
        {
            searchTerm: 'steamboats',
            startPage: 1,
            page: 1,
            totalPages: 0,
            isMorePages: true,
        },
        {
            searchTerm: 'firearms',
            startPage: 1,
            page: 1,
            totalPages: 0,
            isMorePages: true,
        },
    ];
    ctrl.searchItems = [];
    var originatorEv;
    ctrl.isOpen = false;
    ctrl.connected = false;

    ctrl.authItems = {
        default: { name: "Default user", icon: "account", direction: "bottom", show: "true", username: "", tooltip: "Signed in as the Default user." },
        google: { name: "Google", icon: "google", direction: "top", show: "true", username: "", tooltip: "" },
        signout: { name: "Sign out", icon: "sign-out", direction: "bottom", show: "false" }
    };

    ctrl.account = ctrl.authItems.default;

    ctrl.authEvent = function (authItem) {
        console.log(authItem);
        if (authItem.name == 'Sign out') {
            Auth.authObj.$signOut();
            ctrl.authItems.default.show = true;
            ctrl.authItems.google.show = true;
            ctrl.authItems.signout.show = false;
            ctrl.account = ctrl.authItems.default;
        } else {
            Auth.authenticate(authItem.name).then(function (result) {
                if (result.user != undefined) {
                    console.log("Signed in as:", result.user.uid);
                    ctrl.authItems.default.show = false;
                    ctrl.authItems.google.show = false;
                    ctrl.authItems.signout.show = true;
                    var TruncatedUserName = result.user.displayName.substring(0, 1);
                    ctrl.authItems.google.tooltip = "Signed in with Google: " + result.user.email;
                    ctrl.authItems.google.username = TruncatedUserName;
                    ctrl.account = ctrl.authItems.google;
                } else {
                    console.log(result.errorCode + ' ' + result.errorMessage);
                }
                //var firebaseUser = Auth.authObj.$getAuth();

            }).catch(function (error) {
                console.error("Authentication failed:", error);
            });
        }
    }

    ctrl.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    ctrl.authenticate = function () {
        Auth.authenticate();
        //console.log(Auth.authObj);
    }

    ctrl.initProfile = function () {
        var firebaseUser = Auth.authObj.$getAuth();
        if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            ctrl.authItems.default.show = false;
            ctrl.authItems.google.show = false;
            //ctrl.authItems.github.show = false;
            ctrl.authItems.signout.show = true;
            var TruncatedUserName = firebaseUser.displayName.substring(0, 1);
            ctrl.authItems.google.tooltip = "Signed in with Google: " + firebaseUser.email;
            ctrl.authItems.google.username = TruncatedUserName;
            ctrl.account = ctrl.authItems.google;
        } else {
            ctrl.authItems.signout.show = false;
            ctrl.account = ctrl.authItems.default;
            console.log("Signed out");
        }

    }

    ctrl.showSearchItems = function () {
        console.log(ctrl.interestSearches);
    }

    ctrl.showPics = function () {
        console.log(ctrl.pics);
    }

    ctrl.modeChange = function () {
        if (ctrl.isSearchByInterestsModeOn) {
            ctrl.pics = [];
            ctrl.isMoreSearchItems = true;
            ctrl.isPageInfoRetrieved = false;
            ctrl.modeDescription = 'Shuffle';
            ctrl.loadMore();
        } else {
            ctrl.searchTextChange();
        }
    }

    ctrl.searchTextChange = function () {
        ctrl.isSearchByInterestsModeOn = false;
        ctrl.pics = [];
        ctrl.isMoreSearchItems = true;
        ctrl.modeDescription = 'Search';
        ctrl.searchPage = 0;
        ctrl.loadMore();
    }

    ctrl.search = function (searchText) {
        ctrl.isLoadingDone = false;
        ctrl.searchPage++;
        return NyplApiCalls.nyplSearch(searchText, ctrl.searchPage).then(function (results) {
            var data = ctrl.extract(results);
            if (results.data.nyplAPI.response.result == undefined) {
                ctrl.isMoreSearchItems = false;
                ctrl.isLoadingDone = true;
                ctrl.showNoMoreResultsToast();
                return;
            } else {
                angular.forEach(data, function (item) {
                    if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                        ctrl.buildThumbnail(item);
                    }
                });
                if (ctrl.pics.length < 20 && ctrl.isMoreSearchItems) {
                    console.log(ctrl.searchPage);
                    return ctrl.search(searchText, ctrl.searchPage); // not enough thumbnails to fill page, run search again
                }
            }
            ctrl.isLoadingDone = true;
        })
    }

    ctrl.loadMore = function () {
        ctrl.apiLoadCount = 0;
        if (ctrl.isSearchByInterestsModeOn) {
            ctrl.searchItems = [];
            ctrl.searchByInterests(ctrl.interestSearches);
        } else {
            ctrl.search(ctrl.searchText);
        }
    }

    ctrl.incrementInterestSearchPage = function (interestSearch) {
        var nextPageNum = interestSearch.page + 1;
        if (nextPageNum > interestSearch.totalPages) { // since we start at random page, go back to page 1 for more results
            if (interestSearch.startPage >= 1) {
                nextPageNum = 1;
            }
        }

        if (nextPageNum == interestSearch.startPage || nextPageNum > interestSearch.totalPages) { // all pages viewed
            interestSearch.isMorePages = false;
        } else {
            interestSearch.page = nextPageNum;
        }
    }

    ctrl.isSearchesExhausted = function (interestSearches) {
        var result = true;
        angular.forEach(interestSearches, function (search) {
            if (search.isMorePages == true) {
                result = false;
            }
        })
        return result;
    }

    ctrl.searchByInterests = function (interestSearches) {
        ctrl.isLoadingDone = false;
        searches = [];
        ctrl.getPageInfoForInterestSearches(interestSearches).then(function () {
            if (ctrl.isSearchesExhausted(interestSearches)) { // no more pages for interest searches
                ctrl.isMoreSearchItems = false;
                ctrl.showNoMoreResultsToast();
                ctrl.isLoadingDone = true;
                return;
            }
            angular.forEach(interestSearches, function (interestSearch) {
                if (interestSearch.isMorePages) { // only add the search to the q if there are more results for it
                    var search = NyplApiCalls.nyplSearch(interestSearch.searchTerm, interestSearch.page);
                    searches.push(search);
                }
            })
            return ctrl.runApiSearches(searches).then(function (results) {
                angular.forEach(results, function (result, index) {
                    ctrl.incrementInterestSearchPage(interestSearches[index]);
                    var data = ctrl.extract(result);
                    angular.forEach(data, function (item) {
                        ctrl.searchItems.push(item);
                    });
                });
                if (ctrl.searchItems.length < 20 && ctrl.isMoreSearchItems) {
                    return ctrl.searchByInterests(interestSearches); // not enough thumbnails to fill page, run search again
                }
                ctrl.searchItems = lodash.shuffle(ctrl.searchItems); // randomize search results before making thumbnails
                angular.forEach(ctrl.searchItems, function (item) {
                    if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                        ctrl.buildThumbnail(item);
                    }
                });
                ctrl.isLoadingDone = true;
            })

        })
    }

    ctrl.isDuplicate = function (item) {
        return (item.title === String(this));
    }

    ctrl.extract = function (result) {
        if (result.data === undefined) {
            return [];
        } else {
            return result.data.nyplAPI.response.result;
        }
    }

    ctrl.initStartPageNum = function (totalPages) {
        return (lodash.random(1, totalPages));
    };

    ctrl.getPageInfoForInterestSearches = function (interestSearches) {
        var defer = $q.defer();
        if (ctrl.isPageInfoRetrieved) {
            defer.resolve();
        } else {
            var searchPromises = [];
            angular.forEach(interestSearches, function (interestSearch) {
                var search = NyplApiCalls.nyplSearch(interestSearch.searchTerm, interestSearch.page);
                searchPromises.push(search);
            });
            ctrl.runApiSearches(searchPromises).then(function (results) {
                angular.forEach(results, function (result, index) {
                    var totalPages = result.data.nyplAPI.request.totalPages;
                    var startPage = ctrl.initStartPageNum(totalPages);
                    interestSearches[index].totalPages = totalPages;
                    interestSearches[index].startPage = startPage;
                    interestSearches[index].page = startPage;
                });
                ctrl.isPageInfoRetrieved = true;
                defer.resolve();
            })
        }
        return defer.promise;
    }

    ctrl.showNoMoreResultsToast = function () {
        $mdToast.show(
            $mdToast.simple()
                .textContent('No more results found!')
                .position('top right')
                .hideDelay(1500)
        );
    };

    ctrl.runApiSearches = function (searchPromises) {
        var searchResults = [];
        var defer = $q.defer();
        $q.all(searchPromises).then(
            function (results) {
                defer.resolve(results);
                // Handle success
            }, function (err) {
                // Handle errors
            });
        return defer.promise;
    }

    ctrl.getPics = function () {
        console.log(ctrl.pics);
    }

    ctrl.buildThumbnail = function (item) {
        if (item.imageID != undefined) {
            var thumbnail = {};
            thumbnail.data = item;
            thumbnail.title = item.title;
            //thumbnail.fullImageUrl = 'https://images.nypl.org/index.php?id=' + item.imageID + '&t=w';
            thumbnail.fullImageUrl = 'https://images.nypl.org/index.php?id=' + item.imageID + '&t=w';
            thumbnail.cropped = 'https://images.nypl.org/index.php?id=' + item.imageID + '&t=r';
            var img = new Image();
            img.src = thumbnail.fullImageUrl;
            //thumbnail.actualHeight = img.height;//1032;//513;
            thumbnail.actualHeight = ~~(Math.random() * 500) + 100;
            thumbnail.actualWidth = img.width;//343;
            thumbnail.showImageDetail = ctrl.showImageDetail;
            //console.log(thumbnail.title);
            thumbnail.imageID = item.imageID;
            ctrl.pics.push(thumbnail);
        }
    }

    ctrl.showSettings = function (ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
        $mdDialog.show({
            controller: 'SettingsDialogCtrl',
            controllerAs: 'settingsCtrl',
            templateUrl: 'src/grid-list/settings-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen
        })
            .then(function (answer) {
                ctrl.status = 'You said the information was "' + answer + '".';
            }, function () {
                ctrl.status = 'You cancelled the dialog.';
            });
    };

    ctrl.getItemThumbnails = function (response) {
        var promises = [];
        angular.forEach(response, function (item, key) {
            //console.log(item.title);
            if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                ctrl.getThumbnail(item);
            }
        });
    }
    ctrl.isImageClicked = false;

    ctrl.showModal = function (pic) {
        var options = {
            //minHeight: 500,
            //minWidth: element.offsetWidth,
            url: 'data-original',
            inline: false,
            build: function (e) {
                //console.log(e.type);
                ctrl.isViewerBuilt = false;
            },
            built: function (e) {
                //console.log(e.type);
                ctrl.isViewerBuilt = true;
                $scope.$apply();
            },
        };
        $('.image').viewer(options);
    }

    ctrl.showImageDetail = function (pic) {
        ctrl.isImageClicked = true;
        ctrl.showModal(pic);
    };

    ctrl.initProfile();

});