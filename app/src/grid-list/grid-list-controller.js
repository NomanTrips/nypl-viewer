nyplViewer.controller('GridListCtrl', function ($q, $http, NyplApiCalls, $location, $state, $scope, angularGridInstance) {

    ctrl = this;
    ctrl.searchText = 'new york city 1776';
    ctrl.pics = [];

    ctrl.search = function () {
        NyplApiCalls.nyplSearch(ctrl.searchText).then(function (response) {
            // if (ctrl.pics === undefined){
            //   ctrl.pics = [];
            //}
            //ctrl.getItemThumbnails(response);
            //ctrl.response = response;
            //console.log(response);
            ctrl.getItemThumbnails(response);

            //.then(function (results) {
            //  ctrl.pics = ctrl.pics.concat(results);
            // })
        });
    }

    ctrl.loadMore = function () {
        console.log('firing');
        ctrl.search();
    }
    ctrl.getPics = function () {
        console.log(ctrl.pics);
    }

    ctrl.getThumbnail = function (item) {
        if (item.imageID != undefined) {
            var thumbnail = {};
            thumbnail.data = item;
            thumbnail.title = item.title;
            thumbnail.fullImageUrl = 'https://images.nypl.org/index.php?id=' + item.imageID + '&t=w';
            var img = new Image();
            img.src = thumbnail.fullImageUrl;
            //thumbnail.actualHeight = img.height;//1032;//513;
            thumbnail.actualHeight = ~~(Math.random() * 500) + 100;
            thumbnail.actualWidth = img.width;//343;
            thumbnail.showImageDetail = ctrl.showImageDetail;
            //console.log(thumbnail.title);
            ctrl.pics.push(thumbnail);
        }

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

    ctrl.getItemThumbnails = function (response) {
        //console.log(response);
        var promises = [];
        angular.forEach(response, function (item, key) {
            //console.log(item.title);
            if (! ctrl.pics.find(ctrl.isDuplicate, item.title)) {
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

    ctrl.showImageDetail = function (pic) {
        //console.log(pic);
        $state.go('image', { myParam: pic })
        var url = '/image/' + 999;
        $location.path(url);
    };

    ctrl.refresh = function () {
        angularGridInstance.gallery.refresh();
    }

    ctrl.search();
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