nyplViewer.directive('canvasViewer', ['$window', '$http', '$timeout', '$q', 'NyplApiCalls', function ($window, $http, $timeout, $q, NyplApiCalls) {
	var formatReader = new FormatReader();

	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {
			imageSource: '=src',
			overlays: '=overlays',
			title: '@title',
			options: '=options',
			picData: '=picdata',
			closeModal: '&',
		}, // {} = isolate, true = child, false/undefined = no change
		// controller: ['$scope', '$element', '$attrs', '$transclude' ,function(scope, $element, $attrs, $transclude) {
		// 	console.log('la',scope.options);
		// 	console.log(scope.options);

		// }],
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		template: '<div class="viewer-container">' +
		'<md-card class="info-card" flex="25" ng-show="showInfoPanel" style="z-index: 15;position: absolute;top: 80px;left: 0;background-color:white;visibility:visible;">' +
		'<div layout-padding="" >' +
		'<div id="loadingcircle" ng-hide="isLoadingDone" layout-padding="">' +
		'<md-progress-circular md-mode="indeterminate" md-theme="dark-yellow" md-diameter="20px">' +
		' </md-progress-circular>' +
		'</div>' +
		'<div ng-show="isLoadingDone">' +
		'<h4><b>Title: </b>{{title}}</h4>' +
		'<h6><b>Subject: </b>{{subjectsStr}}</h6>' +
		'<h6><b>Collection: </b>{{collection}}</h6>' +
		'<h6><b>Genres: </b>{{genreStr}}</h6>' +
		'<h6><b>Origin info: </b>{{originInfoStr}}</h6>' +
		'<h6><b>Physical description: </b>{{physicalDescription}}</h6>' +
		'<h6><b>Notes: </b>{{noteStr}}</h6>' +
		'</div>' +
		'</div>' +
		'</md-card>' +
		'<div style="z-index : 15;position:absolute;top:0px;right:0px;visibility:visible;">' +
		'<md-button  class="md-icon-button" ng-click="logThis()">' +
		'<md-icon style="color:height:36px;width:36px;" md-svg-icon="cancel" md-menu-align-target=""></md-icon>' +
		'</md-button>' +
		'</div>' +
		'<canvas class="viewer" ' +
		'ng-mouseleave="canMove=false"' +
		'ng-mousedown="mousedown($event)"' +
		'ng-mouseup="mouseup($event)"' +
		'ng-init="canMove=false"' +
		'ng-mousemove="mousedrag($event,canMove)">' +
		'</canvas>' +
		'<div class="title" ng-if="title!=null">{{title}}</div>' +
		'<div class="statictitle"><h6 style="color:white;">{{picData.title}}</h6></div>'+
		'<div class="command" style="visibility:visible;" ng-if="options.controls.image">' +
		'<div class="btn btn-warning" ng-click="showInfo()" ><i class="fa fa-info-circle" aria-hidden="true"></i></div>' +
		'<div class="btn btn-warning" ng-click="options.controls.numPage=options.controls.numPage-1" ng-hide="options.controls.totalPage==1"><i class="fa fa-minus"></i></div>' +
		'<div class="btn btn-warning" ng-hide="options.controls.totalPage==1">{{options.controls.numPage}}/{{options.controls.totalPage}}</div>' +
		'<div class="btn btn-warning" ng-click="options.controls.numPage=options.controls.numPage+1" ng-hide="options.controls.totalPage==1"><i class="fa fa-plus"></i></div>' +
		'<div class="btn btn-warning" ng-click="resizeTo(\'page\')"><i class="fa fa-file-o"></i></div>' +
		'<div class="btn btn-warning" ng-click="rotate(-1)" ng-hide="options.controls.disableRotate"><i class="fa fa-rotate-left"></i></div>' +
		'<div class="btn btn-warning" ng-click="rotate(1)" ng-hide="options.controls.disableRotate"><i class="fa fa-rotate-right"></i></div>' +
		'<div class="btn btn-warning" ng-click="zoom(-1)" ng-hide="options.controls.disableZoom"><i class="fa fa-search-minus"></i></div>' +
		'<div class="btn btn-warning" ng-click="zoom(1)" ng-hide="options.controls.disableZoom"><i class="fa fa-search-plus"></i></div></div>' +
		'<div class="command" ng-if="options.controls.sound">' +
		'<div class="btn btn-warning" ng-click="stop()"><i class="fa fa-stop"></i></div>' +
		'<div class="btn btn-warning" ng-click="play()"><i class="fa fa-play"></i></div>'+
		'</div>'+
		'</div>',
		// templateUrl: '',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function (scope, iElm, iAttrs, controller) {
			scope.showInfoPanel = false;
        	scope.isLoadingDone = false;

			scope.showInfo = function () {
				scope.showInfoPanel = !scope.showInfoPanel;
				if (scope.showInfoPanel) {
					scope.isLoadingDone = false;
					NyplApiCalls.getDetail(scope.picData.apiItemDetailURL).then(function (result) {
						scope.metadata = result.nyplAPI.response.mods;
						try {
							scope.title = scope.metadata.titleInfo.title.$;
						}
						catch (err) {
							scope.title = '';
						}
						try {

							scope.values = '';
							scope.subjectsStr = '';
							if (scope.metadata.hasOwnProperty('subject')) {
								angular.forEach(scope.metadata.subject, function (subject) {
									if (subject.hasOwnProperty('name')) {
										scope.subjectsStr = scope.subjectsStr + 'Name: ' + subject.name.namePart.$ + ' ';
									}

									if (subject.hasOwnProperty('topic')) {
										scope.subjectsStr = scope.subjectsStr + 'Topic: ' + subject.topic.$ + ' ';
									}

									if (subject.hasOwnProperty('geographic')) {
										scope.subjectsStr = scope.subjectsStr + 'Geographic: ' + subject.geographic.$ + ' ';
									}

								})
							}

						}
						catch (err) {
							scope.subjectsStr = '';
						}
						try {
							scope.collection = scope.metadata.nyplAPI.response.mods.location[0].physicalLocation[2].$;
						}
						catch (err) {
							scope.collection = '';
						}
						try {
							scope.values = '';
							if (scope.metadata.hasOwnProperty('originInfo')) {
								if (!Array.isArray(scope.metadata.originInfo)) {
									if (scope.metadata.originInfo.hasOwnProperty('place')) {
										scope.originInfoStr = 'Place: ' + scope.metadata.originInfo.place.placeTerm.$ + ' ';
									}
									if (scope.metadata.originInfo.hasOwnProperty('dateIssued')) {
										scope.originInfoStr = 'Date issued: ' + scope.metadata.originInfo.dateIssued.$;
									}
									if (scope.metadata.originInfo.hasOwnProperty('dateCreated')) {
										if (!Array.isArray(scope.metadata.originInfo.dateCreated)) {
											scope.originInfoStr = 'Created date: ' + scope.metadata.originInfo.dateCreated.$ + ' ';
										} else {
											scope.originInfoStr = 'Created date: ';
											angular.forEach(scope.metadata.originInfo.dateCreated, function (date) {
												if (date.hasOwnProperty('qualifier')) {
													scope.originInfoStr = scope.originInfoStr + date.qualifier + ' ';
												}
												if (date.hasOwnProperty('point')) {
													scope.originInfoStr = scope.originInfoStr + date.point + ' ';
												}
												if (date.hasOwnProperty('$')) {
													scope.originInfoStr = scope.originInfoStr + date.$ + ' ';
												}

											})

										}

									}
								} else {
									angular.forEach(scope.metadata.originInfo, function (originInfo) {
										if (originInfo.hasOwnProperty('place')) {
											scope.originInfoStr = 'Place: ' + originInfo.place.placeTerm.$ + ' ';
										}
										if (originInfo.hasOwnProperty('dateIssued')) {
											scope.originInfoStr = 'Date issued: ' + originInfo.dateIssued.$;
										}
										if (originInfo.hasOwnProperty('dateCreated')) {
											if (!Array.isArray(originInfo.dateCreated)) {
												scope.originInfoStr = 'Created date: ' + originInfo.dateCreated.$ + ' ';
											} else {
												scope.originInfoStr = 'Created date: ';
												angular.forEach(originInfo, function (date) {
													if (date.hasOwnProperty('qualifier')) {
														scope.originInfoStr = scope.originInfoStr + date.qualifier + ' ';
													}
													if (date.hasOwnProperty('point')) {
														scope.originInfoStr = scope.originInfoStr + date.point + ' ';
													}
													if (date.hasOwnProperty('$')) {
														scope.originInfoStr = scope.originInfoStr + date.$ + ' ';
													}

												})

											}

										}
									})
								}
							}

						}
						catch (err) {
							console.log(err);
							scope.originInfoStr = '';
						}
						try {
							scope.values = '';

							if (scope.metadata.hasOwnProperty('note')) {
								scope.noteStr = '';
								if (!Array.isArray(scope.metadata.note)) {
									scope.noteStr = scope.metadata.note.$;
								} else {
									scope.noteStr = '';
									angular.forEach(scope.metadata.note, function (note) {
										if (note.hasOwnProperty('$')) {
											scope.noteStr = scope.noteStr + note.$ + ', ';
										}
									})

								}

							}
						}
						catch (err) {
							scope.noteStr = '';
						}
						try {
							if (scope.metadata.hasOwnProperty('genre')) {
								scope.genreStr = '';
								if (!Array.isArray(scope.metadata.genre)) {
									scope.genreStr = scope.metadata.genre.$;
								} else {
									scope.genreStr = '';
									angular.forEach(scope.metadata.genre, function (genre) {
										if (genre.hasOwnProperty('$')) {
											scope.genreStr = scope.genreStr + genre.$ + ', ';
										}
									})

								}
							}
						}
						catch (err) {
							scope.genreStr = '';
						}

						scope.physicalDescription = '';
						scope.isLoadingDone = true;
					})
				}
			}

			scope.logThis = function () {
				scope.closeModal();
			}
			var canvasEl = iElm.find('canvas')[0];
			var ctx = canvasEl.getContext('2d');

			// look for
			var inNode = angular.element(iElm.find('div')[0])[0];
			var directiveParentNode = inNode.parentNode.parentNode;
			// orce correct canvas size
			var canvasSize = canvasEl.parentNode;
			ctx.canvas.width = canvasSize.clientWidth;
			ctx.canvas.height = canvasSize.clientHeight;
			var resize = { height: canvasSize.clientHeight, width: canvasSize.clientWidth };
			// initialize variable
			var img = null;
			var curPos = { x: 0, y: 0 };
			var picPos = { x: 0, y: 0 };
			var mousePos = { x: 0, y: 0 };
			var overlays = [];
			var reader = null;

			// Merge scope with default values
			scope.options = angular.merge({}, {
				ctx: null,
				adsrc: null,
				zoom: {
					value: 1.0,
					step: 0.1,
					min: 0.05,
					max: 6
				},
				rotate: {
					value: 0,
					step: 90
				},
				controls: {
					toolbar: true,
					image: true,
					sound: false,
					fit: 'page',
					disableZoom: false,
					disableMove: false,
					disableRotate: false,
					numPage: 1,
					totalPage: 1,
					filmStrip: false
				},
				info: {}
			}, scope.options);

			scope.options.ctx = ctx;

			function onload() {
				if (reader == null) {
					return;
				}

				if (reader.rendered) {
					applyTransform();
				} else {
					scope.resizeTo(scope.options.controls.fit);
				}
			}

			scope.$watch('imageSource', function (value) {
				if (value === undefined || value === null)
					return;
				// initialize values on load
				scope.options.zoom.value = 1.0;
				scope.options.rotate.value = 0;
				curPos = { x: 0, y: 0 };
				picPos = { x: 0, y: 0 };

				// test if object or string is input of directive
				if (typeof (value) === 'object') {
					// Object type file
					if (formatReader.IsSupported(value.type)) {
						// get object
						var decoder = formatReader.CreateReader(value.type, value);
						// Create image
						reader = decoder.create(value, scope.options, onload, $q, $timeout, ctx);
					} else {
						console.log(value.type, ' not supported !');
					}
				} else if (typeof (value) === 'string') {
					reader = formatReader.CreateReader("image/jpeg").create(value, scope.options, onload, $q, $timeout);
				}
			});

			scope.$watch('overlays', function (newarr, oldarr) {
				// initialize new overlay
				if (newarr === null || oldarr === null)
					return;

				// new added
				overlays = [];
				angular.forEach(newarr, function (item) {
					overlays.push(item);
				});

				applyTransform();
			}, true);

			scope.$watch('options.zoom.value', function () {
				if (!scope.options.controls.disableZoom) {
					applyTransform();
				}
			});

			scope.$watch('options.rotate.value', function () {
				if (!scope.options.controls.disableRotate) {
					applyTransform();
				}
			});

			scope.$watch('options.controls.fit', function (value) {
				scope.resizeTo(value);
			});

			scope.$watch('options.controls.filmStrip', function (position) {

				if (position) {
					scope.options.controls.disableMove = true;
					scope.options.controls.disableRotate = true;
				} else {
					scope.options.controls.disableMove = false;
					scope.options.controls.disableRotate = false;
				}
				if (reader.refresh != null) {
					reader.refresh();
				}
			});

			scope.$watch('options.controls.numPage', function (value) {
				// Limit page navigation
				if (scope.options.controls.numPage < 1) scope.options.controls.numPage = 1;
				if (scope.options.controls.numPage > scope.options.controls.totalPage) scope.options.controls.numPage = scope.options.controls.totalPage;
				if (reader != null) {
					if (scope.options.controls.filmStrip) {
						// All pages are already rendered so go to correct page
						picPos.y = (scope.options.controls.numPage - 1) * -(reader.height + 15);
						applyTransform();
					} else {
						if (reader.refresh != null) {
							reader.refresh();
						}
					}
				}
			});

			// Bind mousewheel
			angular.element(canvasEl).bind("DOMMouseScroll mousewheel onmousewheel", function ($event) {

				// cross-browser wheel delta
				var event = $window.event || $event; // old IE support
				var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
				if (scope.options.controls.filmStrip) {
					picPos.y += 50 * delta;
					// Limit range
					if (picPos.y > 15) {
						picPos.y = 15;
					}
					if (reader.images) {
						if (picPos.y - reader.height * scope.options.zoom.value < -(reader.height + 15) * reader.images.length * scope.options.zoom.value) {
							picPos.y = -(reader.height + 15) * reader.images.length + reader.height;
						}
					} else {
						if (picPos.y - reader.height * scope.options.zoom.value < -reader.height * scope.options.zoom.value) {
							picPos.y = -reader.height * scope.options.zoom.value;
						}
					}
					//
					scope.$applyAsync(function () {
						applyTransform();
					});
				} else {
					if (delta > 0) {
						scope.zoom(1);
					} else {
						scope.zoom(-1);
					}
				}
				// for IE
				event.returnValue = false;
				// for Chrome and Firefox
				if (event.preventDefault) {
					event.preventDefault();
				}

			});

			function applyTransform() {
				if (reader == null) {
					return;
				}
				if (!reader.rendered) {
					return;
				}
				var options = scope.options;
				var canvas = ctx.canvas;
				var centerX = reader.width * options.zoom.value / 2;
				var centerY = reader.height * options.zoom.value / 2;
				// Clean before draw
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// Save context
				ctx.save();
				// move to mouse position
				ctx.translate((picPos.x + centerX), (picPos.y + centerY));
				// Rotate canvas
				ctx.rotate(options.rotate.value * Math.PI / 180);
				// Go back
				ctx.translate(- centerX, - centerY);
				// Change scale
				if (reader.isZoom)
					ctx.scale(options.zoom.value, options.zoom.value);
				if ((!options.controls.filmStrip) || (options.controls.totalPage == 1)) {
					if (reader.img != null) {

						ctx.drawImage(reader.img, 0, 0, reader.width, reader.height);
						ctx.beginPath();
						ctx.rect(0, 0, reader.width, reader.height);
						ctx.lineWidth = 0.2;
						ctx.strokeStyle = "#000000";
						ctx.stroke();
					}
					// Draw image at correct position with correct scale
					if (reader.data != null) {
						ctx.putImageData(reader.data, picPos.x, picPos.y);
						ctx.beginPath();
						ctx.rect(0, 0, reader.width, reader.height);
						ctx.lineWidth = 0.2;
						ctx.strokeStyle = "#000000";
						ctx.stroke();
					}
				} else {
					if (reader.images != null) {
						angular.forEach(reader.images, function (image) {
							ctx.drawImage(image, 0, 0, image.width, image.height);
							ctx.beginPath();
							ctx.rect(0, 0, image.width, image.height);
							ctx.lineWidth = 0.2;
							ctx.strokeStyle = "#000000";
							ctx.stroke();
							ctx.translate(0, image.height + 15);
						});
					}
					// Draw image at correct position with correct scale
					if (reader.data != null) {
						var offsetY = 0;
						angular.forEach(reader.data, function (data) {
							ctx.putImageData(data, picPos.x, picPos.y + offsetY);
							ctx.beginPath();
							ctx.rect(0, 0, reader.width, reader.height);
							ctx.lineWidth = 0.2;
							ctx.strokeStyle = "#000000";
							ctx.stroke();
							offsetY += reader.height + 15;
							ctx.translate(0, offsetY);
						});
					}
				}
				// Restore
				ctx.restore();

				// Draw overlays
				if (overlays.length > 0) {
					angular.forEach(overlays, function (item) {
						ctx.save();
						// move to mouse position
						ctx.translate((picPos.x + centerX), (picPos.y + centerY));
						// Rotate canvas
						ctx.rotate(options.rotate.value * Math.PI / 180);
						// Go back
						ctx.translate(- centerX, - centerY);
						// Change scale
						ctx.scale(options.zoom.value, options.zoom.value);
						// Start rect draw
						ctx.beginPath();
						ctx.rect((item.x), (item.y), item.w, item.h);
						ctx.fillStyle = item.color;
						ctx.globalAlpha = 0.4;
						ctx.fill();
						ctx.lineWidth = 1;
						ctx.strokeStyle = item.color;
						ctx.stroke();
						ctx.restore();
					});
				}
			}

			angular.element(canvasEl).bind('mousedown', function ($event) {
				if (scope.options.controls.disableMove) {
					return;
				}

				scope.canMove = true;
				curPos.x = $event.offsetX;
				curPos.y = $event.offsetY;
			});

			angular.element(canvasEl).bind('mouseup', function ($event) {
				if (scope.options.controls.disableMove) {
					return;
				}

				scope.canMove = false;
			});

			angular.element(canvasEl).bind('mousemove', function ($event) {
				mousePos.x = $event.offsetX;
				mousePos.y = $event.offsetY;
				if (scope.options.controls.disableMove) {
					return;
				}

				if ((reader !== null) && (scope.canMove)) {
					var coordX = $event.offsetX;
					var coordY = $event.offsetY;
					var translateX = coordX - curPos.x;
					var translateY = coordY - curPos.y;
					picPos.x += translateX;
					picPos.y += translateY;
					applyTransform();
					curPos.x = coordX;
					curPos.y = coordY;
				}
			});

			scope.zoom = function (direction) {
				scope.$applyAsync(function () {
					var oldWidth, newWidth = 0;
					var oldHeight, newHeight = 0;
					// Does reader support zoom ?
					// Compute correct width
					if (!reader.isZoom) {
						oldWidth = reader.oldwidth;
						oldHeight = reader.height;
					} else {
						oldWidth = reader.width * scope.options.zoom.value;
						oldHeight = reader.height * scope.options.zoom.value;
					}

					// Compute new zoom
					scope.options.zoom.value += scope.options.zoom.step * direction;
					// Round
					scope.options.zoom.value = Math.round(scope.options.zoom.value * 100) / 100;
					if (scope.options.zoom.value >= scope.options.zoom.max) {
						scope.options.zoom.value = scope.options.zoom.max;
					}
					if (scope.options.zoom.value <= scope.options.zoom.min) {
						scope.options.zoom.value = scope.options.zoom.min;
					}
					// Refresh picture
					if (reader.refresh != null) {
						reader.refresh();
					}


					// Compute new image size
					if (!reader.isZoom) {
						newWidth = reader.width;
						newHeight = reader.height;
					} else {
						newWidth = reader.width * scope.options.zoom.value;
						newHeight = reader.height * scope.options.zoom.value;
					}
					// new image position after zoom
					picPos.x = picPos.x - (newWidth - oldWidth) / 2;
					picPos.y = picPos.y - (newHeight - oldHeight) / 2;
				});
			}

			scope.rotate = function (direction) {
				scope.$applyAsync(function () {
					scope.options.rotate.value += scope.options.rotate.step * direction;
					if ((scope.options.rotate.value <= -360) || (scope.options.rotate.value >= 360)) {
						scope.options.rotate.value = 0;
					}
					applyTransform();
				});
			};

			var centerPics = function () {
				// Position to canvas center
				var centerX = ctx.canvas.width / 2;
				var centerY = ctx.canvas.height / 2;
				var picPosX = 0;
				var picPosY = centerY - (reader.height * scope.options.zoom.value) / 2;
				picPosX = centerX - (reader.width * scope.options.zoom.value) / 2;
				curPos = { x: picPosX, y: 0 };
				picPos = { x: picPosX, y: picPosY };
			}

			scope.resizeTo = function (value) {
				if ((ctx.canvas == null) || (reader == null)) {
					return;
				}
				// Compute page ratio
				var options = scope.options;
				var ratioH = ctx.canvas.height / reader.height;
				var ratioW = ctx.canvas.width / reader.width;
				// If reader render zoom itself
				// Precompute from its ratio
				if (!reader.isZoom) {
					ratioH *= scope.options.zoom.value;
					ratioW *= scope.options.zoom.value;
				}
				// Adjust value
				switch (value) {
					case 'width': scope.options.zoom.value = ratioW; break;
					case 'height': scope.options.zoom.value = ratioH; break;
					case 'page':
					default: scope.options.zoom.value = .75;//(Math.min(ratioH, ratioW) / 2);
				}
				scope.$applyAsync(function () {
					// Round zoom value
					scope.options.zoom.value = Math.round(scope.options.zoom.value * 100) / 100;
					// Update options state
					scope.options.controls.fit = value;
					if (!reader.isZoom) {
						if (reader.refresh != null) {
							reader.refresh();
						}

						// Re center image
						centerPics();
					} else {
						// Re center image
						centerPics();
						applyTransform();
					}
				});
			}

			scope.play = function () {
				if (scope.options.adsrc != null) {
					scope.options.adsrc.start(0);
				}
			}

			scope.stop = function () {
				if (scope.options.adsrc != null) {
					scope.options.adsrc.stop(0);
				}
			}

			function resizeCanvas() {
				scope.$applyAsync(function () {
					var canvasSize = canvasEl.parentNode;
					ctx.canvas.width = canvasSize.clientWidth;
					ctx.canvas.height = canvasSize.clientHeight;
					applyTransform();
				});
			}
			// Keep object
			function parentChange() {
				if (resize.width != canvasEl.parentNode.clientWidth) {
					resize.width = canvasEl.parentNode.clientWidth;
				}

				if (resize.height != canvasEl.parentNode.clientHeight) {
					resize.height = canvasEl.parentNode.clientHeight;
				}
				return resize;
			}
			//
			scope.$watch(parentChange, function () {
				resizeCanvas();
			}, true);
			//      	// resize canvas on window resize to keep aspect ratio
			// angular.element($window).bind('resize', function() {
			//  	resizeCanvas();
			// });
		}
	};
}]);
