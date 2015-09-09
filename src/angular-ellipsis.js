/**
 *	Angular directive to truncate multi-line text to visible height
 *
 *	@param bind (angular bound value to append) REQUIRED
 *	@param ellipsisAppend (string) string to append at end of truncated text after ellipsis, can be HTML OPTIONAL
 *	@param ellipsisAppendClick (function) function to call if ellipsisAppend is clicked (ellipsisAppend must be clicked) OPTIONAL
 *	@param ellipsisSymbol (string) string to use as ellipsis, replaces default '...' OPTIONAL
 *	@param ellipsisSeparator (string) separator to split string, replaces default ' ' OPTIONAL
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
			ngBindHtml			: '=',
			ellipsisAppend		: '@',
			ellipsisAppendClick	: '&',
			ellipsisSymbol		: '@',
			ellipsisSeparator	: '@'
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
					var binding = scope.ngBind || scope.ngBindHtml;
					if (binding) {
						var i = 0,
							ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
							ellipsisSeparator = (typeof(scope.ellipsisSeparator) !== 'undefined') ? attributes.ellipsisSeparator : ' ',
							appendString = (typeof(scope.ellipsisAppend) !== 'undefined' && scope.ellipsisAppend !== '') ? ellipsisSymbol + '<span>' + scope.ellipsisAppend + '</span>' : ellipsisSymbol,
							bindArray = scope.ngBind.split(ellipsisSeparator);

						attributes.isTruncated = false;
						element.html(binding);

						// If text has overflow
						if (isOverflowed(element)) {
							var bindArrayStartingLength = bindArray.length,
								initialMaxHeight = element[0].clientHeight;

							element.html(binding + appendString);

							//Set data-overflow on element for targeting
							element.attr('data-overflowed', 'true');

							// Set complete text and remove one word at a time, until there is no overflow
							for ( ; i < bindArrayStartingLength; i++) {
								bindArray.pop();
								element.html(bindArray.join(ellipsisSeparator) + appendString);

								if (element[0].scrollHeight < initialMaxHeight || isOverflowed(element) === false) {
									attributes.isTruncated = true;
									break;
								}
							}

							// If append string was passed and append click function included
							if (ellipsisSymbol != appendString && typeof(scope.ellipsisAppendClick) !== 'undefined' && scope.ellipsisAppendClick !== '' ) {
								element.find('span').bind("click", function (e) {
									scope.$apply(scope.ellipsisAppendClick);
								});
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
						$timeout(function() {
							buildEllipsis();
						});
					});

				   /**
					*	Execute ellipsis truncate on ngBindHtml update
					*/
					scope.$watch('ngBindHtml', function () {
						$timeout(function() {
							buildEllipsis();
						});
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

					function onResize() {
						$timeout.cancel(attributes.lastWindowTimeoutEvent);

						attributes.lastWindowTimeoutEvent = $timeout(function() {
							if (attributes.lastWindowResizeWidth != window.innerWidth || attributes.lastWindowResizeHeight != window.innerHeight) {
								buildEllipsis();
							}

							attributes.lastWindowResizeWidth = window.innerWidth;
							attributes.lastWindowResizeHeight = window.innerHeight;
						}, 75);
					}

					var $win = angular.element($window);
					$win.bind('resize', onResize);

					/**
					* Clean up after ourselves
					*/
					scope.$on('$destroy', function() {
					  $win.unbind('resize', onResize);
					});


			};
		}
	};
}]);
