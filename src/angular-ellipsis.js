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
						var str = scope.ngBind,
							ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
							appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? ellipsisSymbol + '<span>' + scope.ellipsisAppend + '</span>' : ellipsisSymbol;

						attributes.isTruncated = false;
						element.html(scope.ngBind);

						var desiredHeight = element[0].clientHeight;
						var actualHeight = element[0].scrollHeight;
						if (actualHeight > desiredHeight) {
							attributes.isTruncated = true;

							var spliter = ' ';
							var lineHeight = parseFloat(element.css('line-height'));

							// the max possible characters that might not overflow the desired height
							var max = Math.ceil(str.length * (desiredHeight + lineHeight) / actualHeight);

							// the min characters that must not overflow the desired height
							var min = Math.floor(str.length * (desiredHeight - lineHeight) / actualHeight);
							min = str.substr(0, min).lastIndexOf(spliter);

							// set with the max possible size, then reduce its size word by word
							var size = str.indexOf(spliter, max);
							if (size < 0) {
								// no spliter after max
								size = max;
							}

							var text = str.substr(0, size).trim();
							var arr = str.substr(min, size - min).trim().split(spliter);
							var idx = arr.length;
							element.html(text + appendString);
							while (isOverflowed(element) && idx >= 0) {
								--idx;
								text = text.substr(0, text.length - arr[idx].length - 1);
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
					 * Execute ellipsis truncate on element size change
					 *
					 * element's size could be changed by some other directives
					 *
					 * added by huang.jian@gteamstaff.com
					 */
					scope.$watch(
						function() {
							return element.width() + 'x' + element.height();
						},
						function (newValue, oldValue) {
							if (newValue !== oldValue){
								buildEllipsis();
							}
						}
					);
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