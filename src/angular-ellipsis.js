/**
 *	Angular directive to truncate multi-line text to visible height
 *
 *	@param bind (angular bound value to append) REQUIRED
 *	@param ellipsisAppend (string) string to append at end of truncated text after ellipsis, can be HTML OPTIONAL
 *	@param ellipsisSymbol (string) string to use as ellipsis, replaces default '...' OPTIONAL
 *	@param ellipsisAppendClick (function) function to call if ellipsisAppend is clicked (ellipsisAppend must be clicked) OPTIONAL
 *
 *	@example <p data-ellipsis data-ng-bind="boundData"></p>
 *	@example <p data-ellipsis data-ng-bind="boundData" data-ellipsis-symbol="---"></p>
 *	@example <p data-ellipsis data-ng-bind="boundData" data-ellipsis-append="read more"></p>
 *	@example <p data-ellipsis data-ng-bind="boundData" data-ellipsis-append="read more" data-ellipsis-append-click="displayFull()"></p>
 *
 */
angular.module('dibari.angular-ellipsis',[])

.directive('ellipsis', ['$timeout', '$window', function($timeout, $window) {

	return {
		restrict	: 'A',
		scope		: {
			ngBind				: '=',
			ellipsisAppend		: '@',
			ellipsisAppendClick	: '&',
			ellipsisSymbol		: '@'
		},
		compile : function(elem, attr, linker) {

			return function(scope, element, attributes) {
				/* Window Resize Variables */
					attributes.lastWindowResizeTime = 0;
					attributes.lastWindowResizeWidth = 0;
					attributes.lastWindowResizeHeight = 0;
					attributes.lastWindowTimeoutEvent = null;
				/* State Variables */
					attributes.isTruncated = false;

				function buildEllipsis() {
					if (typeof(scope.ngBind) !== 'undefined') {
						var bindArray = scope.ngBind.split(" "),
							ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
							appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? ellipsisSymbol + '<span>' + scope.ellipsisAppend + '</span>' : ellipsisSymbol;

						attributes.isTruncated = false;
						element.html(scope.ngBind);

						// refine the algorithm to improve the performance significantly
						//                            --huang.jian@gteamstaff.com 20150228
						var desiredHeight = element[0].clientHeight;
						var actualHeight = element[0].scrollHeight;
						if (actualHeight > desiredHeight) {
							// PERFORMANCE IMPROVEMENT: calc the proper size by heights
							var size = Math.floor(bindArray.length *
																	 desiredHeight / actualHeight);
							var text = bindArray.slice(0, size).join(' ');
							element.html(text + appendString);
							while (isOverflowed(element) && size > 0) {
								--size;
								// PERFORMANCE IMPROVEMENT: use String.substr rather than Array.join
								text = text.substr(0, text.length - bindArray[size].length - 1);
								element.html(text + appendString);
							}
						}
					}
				}


			   /**
				*	Test if element has overflow of text beyond height or max-height
				*
				*	@param element (DOM object)
				*
				*	@return bool
				*
				*/
				function isOverflowed(thisElement) {
					return thisElement[0].scrollHeight > thisElement[0].clientHeight;
				}

			   /**
				*	Watchers
				*/

				   /**
					*	Execute ellipsis truncate on ngBind update
					*/
					scope.$watch('ngBind', function () {
						buildEllipsis();
					});

				   /**
					*	Execute ellipsis truncate on ngBind update
					*/
					scope.$watch('ellipsisAppend', function () {
						buildEllipsis();
					});

				   /**
					*	When window width or height changes - re-init truncation
					*/
					angular.element($window).bind('resize', function () {
						$timeout.cancel(attributes.lastWindowTimeoutEvent);

						attributes.lastWindowTimeoutEvent = $timeout(function() {
							if (attributes.lastWindowResizeWidth != window.innerWidth || attributes.lastWindowResizeHeight != window.innerHeight) {
								buildEllipsis();
							}

							attributes.lastWindowResizeWidth = window.innerWidth;
							attributes.lastWindowResizeHeight = window.innerHeight;
						}, 75);
					});


			};
		}
	};
}]);