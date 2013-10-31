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
					attributes.lastWindowResizeTime = 0;
					attributes.lastWindowResizeWidth = 0;
					attributes.lastWindowResizeHeight = 0;
					attributes.lastWindowTimeoutEvent = null;
					attributes.isTruncated = false;

					function buildEllipsis() {
						if (typeof(scope.ngBind) !== 'undefined') {
							var bindArray = scope.ngBind.split(" "),
								incrementalString = '',
								i = 0,
								ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
								appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? ellipsisSymbol + scope.ellipsisAppend : ellipsisSymbol,
								appendCharCount = (appendString).length;

							attributes.isTruncated = false;

							// Go one word at a time, when word is found to cause overflow, move back one
							for ( ; i < bindArray.length; i++) {
								var prevIncrementalString = incrementalString;

								// Add and test the next word (at space)
								incrementalString = incrementalString + bindArray[i] + ' ' + appendString;
								element.html(incrementalString);

								// If this word caused overflow, use previous string and append append
								if (i > 0 && isOverflowed(element)) {
									element.html(prevIncrementalString.slice(0, -1) + appendString);
									attributes.isTruncated = true;
									break;
								}
								// Else, remove append off end and try again
								else
									incrementalString = incrementalString.slice(0, '-' + appendCharCount);
							}

							// If text did not need be to truncated, remove appended string
							if (attributes.isTruncated === false) {
								var currentString = element.html();
								element.html(currentString.slice(0, '-' + appendCharCount));
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
							}, 150);
						});


				};
			}
		};
	});

})(angular, exampleApp);