nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, $mdMedia, $mdDialog, lodash, $mdToast) {

    ctrl = this;
    ctrl.searchText = 'new york city 1776';
    ctrl.pics = [];
    ctrl.page = 0;
    ctrl.isLoadingDone = true;
    ctrl.isStraightSearchModeOn = false;
    ctrl.modeDescription = 'Shuffle'
    ctrl.searchItems = [
        {
            searchTerm: 'steamboats',
            startPage: 1,
            nextPage: 1,
            totalPages: 0,
            isMorePages: true,
        },
        {
            searchTerm: 'firearms',
            startPage: 1,
            nextPage: 1,
            totalPages: 0,
            isMorePages: true,
        },
        {
            searchTerm: 'george washington',
            startPage: 1,
            nextPage: 1,
            totalPages: 0,
            isMorePages: true,
        },
    ];
    ctrl.isPaginationInfoRetrieved = false;
    ctrl.isMoreItems = true;

    ctrl.initStartPageNums = function (interests) {
        angular.forEach(interests, function (interest, key) {
            if (ctrl.isStraightSearchModeOn) {
                interest.startPage = 1;
            } else { // Load random items for interest
                interest.startPage = ctrl.generateRandomStartPageNum(interest.totalPages);
            }
            interest.currentPage = interest.startPage;
        })
    };

    ctrl.showSearchItems = function () {
        console.log(ctrl.searchItems);
    }

    ctrl.modeChange = function () {
        ctrl.pics = [];
        if (ctrl.isStraightSearchModeOn) {
            ctrl.modeDescription = 'Straight search';
            ctrl.searchTextChange();
        } else {
            ctrl.modeDescription = 'Shuffle';
            ctrl.loadThumbnails();
        }
    }

    ctrl.searchTextChange = function () {
        ctrl.pics = [];
        ctrl.isStraightSearchModeOn = true;
        ctrl.searchItems = [
            {
                name: ctrl.searchText,
                startPage: 1,
                currentPage: 1,
                totalPages: 0,
            }
        ]
        ctrl.loadThumbnails();
    }

    ctrl.generateRandomStartPageNum = function (totalPages) {
        var lowRandomNum = (lodash.random(1, totalPages));
        return lowRandomNum;
    }

    ctrl.incrementCurrentPage = function (searchItem) {
        var nextPageNum = searchItem.currentPage + 1;
        if (nextPageNum > searchItem.totalPages) {
            if (searchItem.startPage > 1) {
                nextPageNum = 1;
            } else {
                nextPageNum = -1;
            }
        }
        searchItem.currentPage = nextPageNum;
    }

    ctrl.search = function (searches) {
        searchPromises = [];
        angular.forEach(searches, function (search) {
            var searchHttpCall = NyplApiCalls.nyplSearch(search.searchTerm, search.nextPage);
            searchPromises.push(searchHttpCall);
        });
        return ctrl.runApiSearches(searchPromises);
    }

    ctrl.runApiSearches = function (searchPromises) {
        var searchResults = [];
        var defer = $q.defer();
        $q.all(searchPromises).then(
            function (results) {
                angular.forEach(results, function (result, index) {
                    var items = extract(result);
                    angular.forEach(items, function (item, key) {
                        searchResults.push(item);
                    });
                    //ctrl.interests[index].page = ctrl.interests[index].page + 1;
                    ctrl.incrementCurrentPage(searchItems[index]);
                });
                defer.resolve(lodash.shuffle(searchResults));
                // Handle success
            }, function (err) {
                // Handle errors
            });

        return defer.promise;
    }

    ctrl.loadThumbnails = function () {
        ctrl.isLoadingDone = false;
        var apiCalledCount = 0;
        ctrl.getPageinationInfoForInterests(ctrl.searchItems, ctrl.isPaginationInfoRetrieved).then(function () {
            ctrl.initStartPageNums(ctrl.searchItems);
            searches = [];
            angular.forEach(searchItems, function (searchItem) {
                if (searchItem.isMorePages) {
                    searches.push(searchItem);
                }
            })

            if (searches.length == 0) { // no searches that will return items left to run...
                ctrl.isMoreItems = false;
                ctrl.showNoMoreResultsToast();
                return;
            }

            ctrl.search(searches).then(function (searchResults) {
                apiCalledCount++;
                angular.forEach(searchResults, function (searchResult) {
                    if (!ctrl.pics.find(ctrl.isDuplicate, searchResult.title)) {
                        ctrl.getThumbnail(searchResult);
                    }
                });

                if (apiCalledCount > 20 || ctrl.isMoreItems == false) { // Only call api 20 times for items before quiting to prevent overloading
                    ctrl.isLoadingDone = true;
                    return;
                }
                if (ctrl.pics.length < 20) {
                    return ctrl.search(searches);
                }

                ctrl.isLoadingDone = true;
            });
        })


    }

    ctrl.getPics = function () {
        console.log(ctrl.pics);

    }

    ctrl.getThumbnail = function (item) {
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

    ctrl.isDuplicate = function (item) {
        return (item.title === String(this));
    }

    function extract(result) {
        if (result.data === undefined) {
            return [];
        } else {
            return result.data.nyplAPI.response.result;
        }
    }

    ctrl.getPageinationInfoForInterests = function (searchItems, isPaginationInfoRetrieved) {
        var defer = $q.defer();
        if (isPaginationInfoRetrieved) {
            defer.resolve();
            return;
        }

        var searchPromises = [];
        angular.forEach(searchItem, function (searchItem) {
            var search = NyplApiCalls.nyplSearch(searchItem.name, searchItem.currentPage);
            searchPromises.push(search);
        });

        $q.all(searchPromises).then(
            function (results) {
                angular.forEach(results, function (result, index) {
                    var totalPages = result.data.nyplAPI.request.totalPages;
                    searchItems[index].totalPages = totalPages;
                });
                isPaginationInfoRetrieved = true;
                defer.resolve();
                // Handle success
            }, function (err) {
                // Handle errors
            });

        return defer.promise;
    }

    ctrl.showNoMoreResultsToast = function () {
        $mdToast.show(
            $mdToast.simple()
                .textContent('No more results found for your interests!')
                .position('top right')
                .hideDelay(1500)
        );
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

});