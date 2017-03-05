nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, $mdMedia, $mdDialog, lodash, $mdToast) {

    ctrl = this;
    ctrl.searchText = 'new york city 1776';
    ctrl.pics = [];
    ctrl.page = 0;
    ctrl.isLoadingDone = true;
    ctrl.interests = [
        {
            name: 'steam engine',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        },
        {
            name: 'jaeger',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        },
        {
            name: 'musket',
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
        {
            name: 'philidelphia',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        },
        {
            name: 'clock',
            startPage: 1,
            currentPage: 1,
            totalPages: 0,
        }
    ];
    ctrl.isPaginationInfoRetrieved = false;
    ctrl.isMoreItems = true;

    ctrl.initStartPageNums = function (interests) {
        angular.forEach(interests, function (interest, key) {
            interest.startPage = ctrl.generateRandomStartPageNum(interest.totalPages);
            interest.currentPage = interest.startPage;
        })
    };

    ctrl.showInterests = function () {
        console.log(ctrl.interests);
    }
    ctrl.searchTextChange = function () {
        ctrl.page = 0;
        ctrl.pics = [];
        ctrl.search();
    }

    ctrl.generateRandomStartPageNum = function (totalPages) {
        return lodash.random(1, totalPages);
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
        ctrl.runApiSearches(ctrl.interests).then(function (results) {
            angular.forEach(results, function (item, key) {
                if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                    ctrl.getThumbnail(item);
                }
            });
            
            /** 
            if (ctrl.pics.length < 20) {
                ctrl.runApiSearches(ctrl.interests).then(function (results) {
                    angular.forEach(results, function (item, key) {
                        if (!ctrl.pics.find(ctrl.isDuplicate, item.title)) {
                            ctrl.getThumbnail(item);
                        }
                    });
                })
            }*/

        })


        /** 
        ctrl.isLoadingDone = false;
        ctrl.page = ctrl.page + 1;
        var interestOne = ctrl.interests[Math.floor(Math.random() * ctrl.interests.length)]; // just a random element from interest arr
        NyplApiCalls.nyplSearch(interestOne.name, interestOne.page).then(function (response) {
            ctrl.getItemThumbnails(response);
            interestOne.page = interestOne.page + 1;
            var interestTwo = ctrl.interests[Math.floor(Math.random() * ctrl.interests.length)];
            NyplApiCalls.nyplSearch(interestTwo.name, interestTwo.page).then(function (response) {
                ctrl.getItemThumbnails(response);
                interestTwo.page = interestTwo.page + 1;
                ctrl.isLoadingDone = true;
            });
 
        });
        */
    }

    ctrl.loadMore = function () {
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

        //results.push(thumbnail);
        //console.log(item.title);
        /** 
        return NyplApiCalls.getImage(item)
            .then(function (itemWithImageUrl) {
                if (itemWithImageUrl != undefined) {
                    //console.log(itemWithImageUrl);
                    var thumbnail = {};
                    thumbnail.data = itemWithImageUrl.item;
                    thumbnail.image = itemWithImageUrl.thumbnailUrl;
                    thumbnail.title = itemWithImageUrl.title;
 
                    var img = new Image();
                    img.src = thumbnail.fullImageUrl;
                    //thumbnail.actualHeight = img.height;//1032;//513;
                    thumbnail.actualHeight = ~~(Math.random() * 500) + 100;
                    thumbnail.actualWidth = img.width;//343;
                    thumbnail.fullImageUrl = itemWithImageUrl.fullImageUrl;
                    thumbnail.showImageDetail = ctrl.showImageDetail;
                    //console.log(thumbnail.title);
                    ctrl.pics.push(thumbnail);
                    //results.push(thumbnail);
 
                }
                return thumbnail;
 
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
 
            });
            */
    }

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
            //var itemCopy = item;
            //promises.push(ctrl.getThumbnail(itemCopy, function (thumbnail) {
            //ctrl.pics.push(thumbnail);
            //}));
        });
        //$q.all(promises).then(function () {
        //callback();
        //  console.log('fin...');
        //});

        //console.log(response);
        //var deferred = $q.defer();
        //var numReturned = 0;
        //var results = [];
        //angular.forEach(response, function (value, key) {

        //});
        //return deferred.promise;
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
        // ctrl.fullImageUrl = pic.fullImageUrl;
        ctrl.isImageClicked = true;
        ctrl.showModal(pic);
        // $state.go('image', { myParam: pic })
        // var url = '/image/' + 999;
        //$location.path(url);
    };

    // ctrl.refresh = function () {
    //   angularGridInstance.gallery.refresh();
    //}

    //ctrl.search();

});
/** 
nyplViewer.controller('GridListCtrl', function ($http, NyplApiCalls, $mdMedia, $mdDialog, $location, $state) {
    ctrl = this;
    ctrl.year = 1776;

    ctrl.showImageDialog = function (ev, tile) {
        $state.go('image', {myParam: tile})
        //var url = '/image/' + 999;
        //$location.path(url);
        //console.log(url);
        /** 
        console.log('running show dialog');
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
        $mdDialog.show({
            locals:{event: ev, tile: tile},
            controller: 'ImageDialogCtrl',
            controllerAs: 'dialogCtrl',
            templateUrl: 'src/grid-list/image-dialog.html',
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

    ctrl.nyplItems = NyplApiCalls.nyplSearch(ctrl.year)
        .then(function (response) {
            //console.log(response.length);
            ctrl.tiles = buildGridModel({
                icon: "avatar:svg-",
                title: "Svg-",
                background: "",
                image: "",
                showImageDialog: ctrl.showImageDialog
            }, response);
        }).catch(function (error) {
            console.log(error);
        }).finally(function () {

        });

    ctrl.refresh = function () {
        ctrl.nyplItems = NyplApiCalls.nyplSearch(ctrl.year)
            .then(function (response) {
                //console.log(response.length);
                ctrl.tiles = buildGridModel({
                    icon: "avatar:svg-",
                    title: "Svg-",
                    background: "",
                    image: ""
                }, response);
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {

            });
    }

    function buildGridModel(tileTmpl, response) {
        var it, results = [];
        angular.forEach(response, function (value, key) {

            NyplApiCalls.getImage(value)
                .then(function (itemWithImageUrl) {
                    var item = itemWithImageUrl.item;
                    it = angular.extend({}, tileTmpl);
                    it.image = itemWithImageUrl.thumbnailUrl;
                    it.title = itemWithImageUrl.title;
                    it.fullImageUrl = itemWithImageUrl.fullImageUrl;

                    //it.icon = it.icon + (j + 1);
                    results.push(it);
                }).catch(function (error) {
                    console.log(error);
                }).finally(function () {

                });

        });

        return results;
    }

})
*/