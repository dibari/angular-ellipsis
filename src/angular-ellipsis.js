/**
 *	Angular directive to truncate multi-line text to visible height
 *
 *	@param bind (angular bound value to append) REQUIRED
 *
 *	@example <p data-ellipsis data-ng-bind="boundData"></p>
 *
 */

(function(ng, app){

	"use strict";

	app.directive('ellipsis', function($timeout, $window) {

		return {
			restrict	: 'A',
			scope		: {
				ngBind				: '=',
				ellipsisAppend		: '@',
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
								i = 0,
								ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
								appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? ellipsisSymbol + scope.ellipsisAppend : ellipsisSymbol;

							attributes.isTruncated = false;
							element.html(scope.ngBind);

							// If text has overflow
							if (isOverflowed(element)) {
								var bindArrayStartingLength = bindArray.length,
									initialMaxHeight = element[0].clientHeight;

								element.html(scope.ngBind + appendString);

								// Set complete text and remove one word at a time, until there is no overflow
								for ( ; i < bindArrayStartingLength; i++) {
									bindArray.pop();
									element.html(bindArray.join(" ") + appendString);

									if (element[0].scrollHeight < initialMaxHeight || isOverflowed(element) === false) {
										attributes.isTruncated = true;
										break;
									}
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
	});

})(angular, exampleApp);