nyplViewer.controller('ImageViewerCtrl', function ($scope, $timeout, $stateParams) {
    ctrl = this;
    ctrl.fullImageUrl = $stateParams.myParam.fullImageUrl;
    ctrl.thumbNail = $stateParams.myParam.image;
    ctrl.title = $stateParams.myParam.title;
    //ctrl.isViewerBuilt = false;
    //var element = document.getElementById("OGimage");
    var options = {
        //minHeight: 500,
        //minWidth: element.offsetWidth,
        inline: true,
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


    ctrl.isTranscribe = false;
    ctrl.transcription = "empty";
    ctrl.transcribe = function () {
        ctrl.isTranscribe = true;

    }
    /**
     ctrl.openPhotoSwipe = function () {
         var pswpElement = document.querySelectorAll('.pswp')[0];
 
         // build items array
         var items = [
             {
                 src: ctrl.fullImageUrl,
                 w: 964,
                 h: 1024
             },
         ];
 
         // define options (if needed)
         var options = {
             // history & focus options are disabled on CodePen        
             history: false,
             focus: false,
 
             // ...
             // Your other options,
             // ...
             getDoubleTapZoom: function (isMouseClick, item) {
                 if (isMouseClick) {
                     return 2; //<---- This 4
                 } else {
                     return item.initialZoomLevel < 0.7 ? 2 : 1.33; //<---- 4 here
                 }
             },
             maxSpreadZoom: 2, //<---- and this 4 here
 
             showAnimationDuration: 0,
             hideAnimationDuration: 0
 
         };
 
         var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
         gallery.init();
     };
 
     ctrl.openPhotoSwipe();
 */
    //document.getElementById('btn').onclick = openPhotoSwipe;

});