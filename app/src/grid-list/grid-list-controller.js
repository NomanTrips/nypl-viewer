nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, $mdMedia, $mdDialog, lodash, $mdToast, Auth, $stateParams, FirebaseStorageModel) {

    ctrl = this;
    ctrl.pics = [];
    ctrl.masonryImages = [];
    ctrl.searchPage = 0;
    ctrl.isLoadingDone = true;
    ctrl.isSearchByThemeModeOn = false;
    ctrl.modeDescription = 'Search'
    ctrl.isPageInfoRetrieved = false;
    ctrl.isMoreSearchItems = true;
    ctrl.interestSearches = [];
    ctrl.isInitialLoad = true;
    ctrl.searchRanCount = 0;
    ctrl.metadataFilter = 'All';
    //$scope.currentState = $transition$.to().name;
    //this.fetchSearchTerms = (barId) => {
    //  $scope.bar = null;
    //  $http.get('bars.json')
    //  .then(resp => $scope.bar = resp.data.find(bar => bar.id == barId ))
    //}
    //this.fetchSearchTerms($transition$.params().searchTerms);
    this.uiOnParamsChanged = (newParams) => {
        // if (newParams.barId !== undefined) this.fetchBar(newParams.barId);
    };

    /** 
    [
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
    */
    /*
    ctrl.theme = {
        name: 'Industrial revolution in America',
        items: [
            {
                search: 'steamboats',
                page: 1,
                totalPages: null,
                isPageInfoRetrieved: false,
            },
            {
                search: 'railroads',
                page: 1,
                totalPages: null,
                isPageInfoRetrieved: false,
            },
            {
                search: 'andrew carnegie',
                page: 1,
                totalPages: null,
                isPageInfoRetrieved: false,
            },
        ]
    };
*/
    ctrl.defaultSearches = ['steamboats','American civil war','Samuel colt','Brooklyn bridge','firearms', 'rough riders', 'plains indians'];
    ctrl.searchText = lodash.sample(ctrl.defaultSearches);
    ctrl.searchItems = [];
    ctrl.searchResults = [];
    var originatorEv;
    ctrl.isOpen = false;
    ctrl.connected = false;

    ctrl.initInterestSearches = function () {
        deferred = $q.defer();
        if (ctrl.interestSearches.length != 0) {
            deferred.resolve();
        } else {
            FirebaseStorageModel.getSettings().then(function (settings) {
                ctrl.settings = settings;
                if (ctrl.settings == null) {
                    ctrl.selectedInterests = [];
                } else {
                    console.log(ctrl.settings.interests);
                    ctrl.selectedInterests = ctrl.settings.interests;
                    angular.forEach(ctrl.selectedInterests, function (interest) {
                        ctrl.interestSearches.push({
                            searchTerm: interest,
                            startPage: 1,
                            page: 1,
                            totalPages: 0,
                            isMorePages: true,
                        })
                    })
                }
                deferred.resolve();
            })
        }
        return deferred.promise;
    }

    ctrl.authItems = {
        default: { name: "Default user", icon: "account", direction: "bottom", show: "true", username: "", tooltip: "Signed in as the Default user." },
        anonymous: { name: "Anonymous", icon: "account", direction: "bottom", show: "true", username: "", tooltip: "Signed in Anonymously." },
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
                    console.log("Signed in as:", result.user);
                    if (result.user.isAnonymous) {
                        ctrl.authItems.default.show = false;
                        ctrl.authItems.google.show = true;
                        ctrl.authItems.anonymous.show = false;
                        ctrl.authItems.signout.show = true;
                        ctrl.authItems.google.username = TruncatedUserName;
                        ctrl.account = ctrl.authItems.anonymous;
                    } else {
                        ctrl.authItems.default.show = false;
                        ctrl.authItems.google.show = false;
                        ctrl.authItems.signout.show = true;
                        var TruncatedUserName = result.user.displayName.substring(0, 1);
                        ctrl.authItems.google.tooltip = "Signed in with Google: " + result.user.email;
                        ctrl.authItems.google.username = TruncatedUserName;
                        ctrl.account = ctrl.authItems.google;
                    }

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

    ctrl.showSearchItems = function () {
        console.log(ctrl.theme.items);
    }

    ctrl.showPics = function () {
        console.log(ctrl.pics);
    }

    ctrl.modeChange = function () {
        if (ctrl.isSearchByThemeModeOn) {
            $location.url($location.path()); // remove url params in order to load new theme
            //var url = '/search';
            //$location.path(url);
            ctrl.pics = [];
            ctrl.masonryImages = [];
            ctrl.isMoreSearchItems = true;
            ctrl.isPageInfoRetrieved = false;
            ctrl.modeDescription = 'Theme';
            ctrl.loadMore();
        } else {
            ctrl.modeDescription = 'Search';
            ctrl.searchTextChange();
        }
    }

    ctrl.searchTextChange = function () {
        ctrl.isSearchByThemeModeOn = false;
        ctrl.pics = [];
        ctrl.masonryImages = [];
        ctrl.isMoreSearchItems = true;
        ctrl.modeDescription = 'Search';
        ctrl.searchPage = 0;
        ctrl.loadMore();
    }

    ctrl.search = function (searchText) {
        console.log(ctrl.metadataFilter);
        console.log('running straight search');
        ctrl.isLoadingDone = false;
        ctrl.searchPage++;
        return NyplApiCalls.nyplSearch(searchText, ctrl.searchPage, ctrl.metadataFilter).then(function (results) {
            ctrl.searchRanCount = ctrl.searchRanCount + 1;
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
                ctrl.masonryImages = ctrl.masonryImages.concat(ctrl.pics);
                ctrl.pics = [];
                if (ctrl.searchRanCount < 3) {
                    if (ctrl.pics.length < 20 && ctrl.isMoreSearchItems) {
                        return ctrl.search(searchText, ctrl.searchPage); // not enough thumbnails to fill page, run search again
                    }
                }

            }
            ctrl.isLoadingDone = true;
        })
    }

    ctrl.getTheme = function () {
        deferred = $q.defer();
        var firebaseUser = Auth.authObj.$getAuth();
        if (ctrl.theme != null || !firebaseUser) {
            deferred.resolve();
        } else {
            FirebaseStorageModel.getUserInfo().then(function (user) {
                if (user.selectedTheme == null) {
                    console.log('No settings available  for this user!');
                } else {
                    ctrl.theme = user.selectedTheme;
                    ctrl.searchText = ctrl.theme.name;
                }
                deferred.resolve();
            })
        }
        return deferred.promise;
    }

    ctrl.setQueryParams = function () {
        var queryParamsStr = '';
        var name = '';
        name = ctrl.theme.name;
        angular.forEach(ctrl.theme.items, function (item) {
            if (queryParamsStr == '') {
                queryParamsStr = item.search;
            } else {
                queryParamsStr = queryParamsStr + ',' + item.search;
            }
        });
        $state.go('.', { themeName: name, searchTerms: queryParamsStr }, { notify: false });
    }

    ctrl.loadMore = function () {
        ctrl.searchRanCount = 0;
        ctrl.apiLoadCount = 0;
        if ($stateParams.searchTerms != null && ctrl.isInitialLoad == true) { // theme via url and not firebase
            var searchName = '';
            if ($stateParams.themeName == null) {
                ctrl.searchText = $stateParams.searchTerms;
                ctrl.isSearchByThemeModeOn = false;
            } else {
                ctrl.searchText = $stateParams.themeName;
            }
            ctrl.theme = { name: $stateParams.themeName, items: [] };
            var searchTerms = $stateParams.searchTerms.split(',');
            angular.forEach(searchTerms, function (searchTerm) {
                var item = {
                    search: searchTerm,
                    page: 1,
                    totalPages: null,
                    isPageInfoRetrieved: false,
                };
                ctrl.theme.items.push(item);
            });
            ctrl.isInitialLoad = false;
        }
        if (ctrl.isSearchByThemeModeOn) {
            //ctrl.searchItems = [];
            ctrl.searchResults = [];
            ctrl.getTheme().then(function () {
                ctrl.setQueryParams();
                ctrl.themeSearch();
            })
            //ctrl.searchByInterests(ctrl.interestSearches);
        } else {
            ctrl.search(ctrl.searchText);
            $state.go('.', { themeName: null, searchTerms: ctrl.searchText }, { notify: false });
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

    ctrl.themeSearch = function () {
        console.log('running theme search');
        searches = [];
        angular.forEach(ctrl.theme.items, function (item) {
            if (item.isPageInfoRetrieved == false || item.page <= item.totalPages) { // only add the search to the q if there are more results for it
                var search = NyplApiCalls.nyplSearch(item.search, item.page);
                item.page = item.page + 1;
                searches.push(search);
            }
        })
        if (searches.length == 0) { // no more pages for the theme
            ctrl.isMoreSearchItems = false;
            ctrl.showNoMoreResultsToast();
            ctrl.isLoadingDone = true;
            return;
        }
        return ctrl.runApiSearches(searches).then(function (results) {
            ctrl.searchRanCount = ctrl.searchRanCount +1;
            angular.forEach(results, function (result, index) {
                ctrl.theme.items[index].totalPages = result.data.nyplAPI.request.totalPages;
                ctrl.theme.items[index].isPageInfoRetrieved = true;
                var data = ctrl.extract(result);
                angular.forEach(data, function (item) {
                    ctrl.searchResults.push(item);
                });
            });
            if (ctrl.searchRanCount < 3) { // stop running searches.... too few items for search
                if (ctrl.searchResults.length < 20 && ctrl.isMoreSearchItems) {
                    return ctrl.themeSearch(ctrl.theme.items); // not enough thumbnails to fill page, run search again
                }
            }

            ctrl.searchResults = lodash.shuffle(ctrl.searchResults); // randomize search results before making thumbnails
            angular.forEach(ctrl.searchResults, function (searchResult) {
                if (!ctrl.pics.find(ctrl.isDuplicate, searchResult.title)) {
                    ctrl.buildThumbnail(searchResult);
                }
            });
        })
    }

    ctrl.searchByInterests = function (interestSearches) {
        ctrl.isLoadingDone = false;
        searches = [];
        ctrl.initInterestSearches().then(function () {
            console.log(ctrl.interestSearches);
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
        ctrl.isLoadingDone = false;
        var searchResults = [];
        var defer = $q.defer();
        $q.all(searchPromises).then(
            function (results) {
                ctrl.isLoadingDone = true;
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


    ctrl.showViewer = function (ev, pic) {
        var useFullScreen = true;

        $mdDialog.show({
            locals: { picInfo: pic.data, picUrl: pic.fullImageUrl },
            controller: 'ImageViewerCtrl',
            controllerAs: 'viewer',
            templateUrl: 'src/grid-list/image-viewer.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
        })
            .then(function (answer) {
                ctrl.status = 'You said the information was "' + answer + '".';
            }, function () {
                ctrl.status = 'You cancelled the dialog.';
            });

    }

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

    ctrl.initProfile = function () {
        var firebaseUser = Auth.authObj.$getAuth();
        if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            ctrl.authItems.default.show = false;
            ctrl.authItems.google.show = false;
            ctrl.authItems.signout.show = true;
            if (firebaseUser.isAnonymous) {
                ctrl.authItems.google.show = true;
                ctrl.authItems.signout.show = true;
                ctrl.authItems.anonymous.show = true;
                ctrl.account = ctrl.authItems.anonymous;
            } else {
                var TruncatedUserName = firebaseUser.displayName.substring(0, 1);
                ctrl.authItems.google.tooltip = "Signed in with Google: " + firebaseUser.email;
                ctrl.authItems.google.username = TruncatedUserName;
                ctrl.account = ctrl.authItems.google;
            }

        } else {
            Auth.authenticate('Anonymous').then(function (result) {
                ctrl.authItems.signout.show = false;
                ctrl.account = ctrl.authItems.anonymous;
                console.log("Logged in as Anonymous");
            });

        }

    }
    //ctrl.initProfile();

});