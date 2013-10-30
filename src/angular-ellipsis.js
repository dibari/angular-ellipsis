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

	app.directive('ellipsis', function() {

		return {
			restrict	: 'A',
			scope		: {
				ngBind			: '=',
				ellipsisAppend	: '@'
			},
			compile : function(elem, attr, linker) {

				return function(scope, element, attributes) {

					function buildEllipsis() {
						if (typeof(scope.ngBind) !== 'undefined') {
							var bindArray = scope.ngBind.split(" "),
								elementStyles = window.getComputedStyle(element[0], null),
								incrementalString = '',
								i = 0,
								appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? scope.ellipsisAppend : '',
								appendCharCount = ('&hellip;' + appendString).length;

							// Go one word at a time, when word is found to cause overflow, move back one
							for ( ; i < bindArray.length; i++) {
								var prevIncrementalString = incrementalString;

								// Add and test the next word (at space)
								incrementalString = incrementalString + bindArray[i] + ' ' + '&hellip;' + appendString;
								element.html(incrementalString);

								// If this word caused overflow, use previous string and append append
								if (i > 0 && isOverflowed(element)) {
									element.html(prevIncrementalString.slice(0, -1) + '&hellip;' + appendString);
									break;
								}
								// Else, remove append off end and try again
								else {
									incrementalString = incrementalString.slice(0, '-' + appendCharCount);
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

				};
			}
		};
	});

})(angular, exampleApp);