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
        */
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