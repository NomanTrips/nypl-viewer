nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, $mdMedia, $mdDialog, lodash, $mdToast) {

    ctrl = this;
    ctrl.searchText = 'new york city 1776';
    ctrl.pics = [];
    ctrl.page = 0;
    ctrl.isLoadingDone = true;
    ctrl.isStraightSearchModeOn = false;
    ctrl.modeDescription = 'Shuffle'
    ctrl.interests = [
        {
            name: 'steamboats',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        },
        {
            name: 'firearms',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        },
        {
            name: 'george washington',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
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

    ctrl.showInterests = function () {
        console.log(ctrl.interests);
    }

    ctrl.modeChange = function () {
        ctrl.pics =[];
        if (ctrl.isStraightSearchModeOn) {
            ctrl.modeDescription = 'Straight search';
            ctrl.searchTextChange();
        } else {
            ctrl.modeDescription = 'Shuffle';
            ctrl.loadThumbnails();
        }
    }

    ctrl.searchTextChange = function () {
        ctrl.pics =[];
        ctrl.isStraightSearchModeOn = true;
        ctrl.interests = [
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

    ctrl.incrementCurrentPage = function (interest) {
        var nextPageNum = interest.currentPage + 1;
        if (nextPageNum > interest.totalPages) {
            if (interest.startPage > 1) {
                nextPageNum = 1;
            } else {
                nextPageNum = -1;
            }
        }
        interest.currentPage = nextPageNum;
    }

    ctrl.search = function () {
        ctrl.isLoadingDone = false;
        var loadCount = 0;
        return ctrl.runApiSearches(ctrl.interests)
            .then(function (results) {
                console.log('api search returned');
                angular.forEach(results, function (item, key) {
                    if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                        ctrl.getThumbnail(item);
                    }
                });

                loadCount++;

                if (loadCount > 20 || ctrl.isMoreItems == false) {
                    ctrl.isLoadingDone = true;
                    return;
                }
                if (ctrl.pics.length < 20) {
                    return ctrl.search();
                }
                ctrl.isLoadingDone = true;
            });
    }

    ctrl.loadThumbnails = function () {
        console.log('firing load more');
        if (ctrl.isPaginationInfoRetrieved) {
            ctrl.search();
        } else {
            ctrl.getPageinationInfoForInterests(ctrl.interests).then(function () {
                ctrl.initStartPageNums(ctrl.interests);
                ctrl.search();
                ctrl.isPaginationInfoRetrieved = true;
            })
        }
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

    ctrl.getPageinationInfoForInterests = function (interests) {
        var promises = [];
        angular.forEach(interests, function (interest) {
            var search = NyplApiCalls.nyplSearch(interest.name, interest.currentPage);
            promises.push(search);
        });

        var defer = $q.defer();

        $q.all(promises).then(
            function (results) {
                angular.forEach(results, function (result, index) {
                    var totalPages = result.data.nyplAPI.request.totalPages;
                    interests[index].totalPages = totalPages;
                });
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

    ctrl.runApiSearches = function (interests) {
        var promises = [];
        var interestsResults = [];
        var defer = $q.defer();
        angular.forEach(interests, function (interest) {
            if (interest.currentPage != -1) {
                var search = NyplApiCalls.nyplSearch(interest.name, interest.currentPage);
                promises.push(search);
            }
        });

        if (promises.length == 0) {
            ctrl.isMoreItems = false;
            defer.resolve([]);
            ctrl.showNoMoreResultsToast();
        }


        $q.all(promises).then(
            function (results) {
                angular.forEach(results, function (result, index) {
                    var items = extract(result);
                    angular.forEach(items, function (item, key) {
                        interestsResults.push(item);
                    });
                    //ctrl.interests[index].page = ctrl.interests[index].page + 1;
                    ctrl.incrementCurrentPage(interests[index]);
                });
                defer.resolve(lodash.shuffle(interestsResults));
                // Handle success
            }, function (err) {
                // Handle errors
            });

        return defer.promise;
    }

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