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
angular.module('dibari.angular-ellipsis', [])

.directive('ellipsis', ['$timeout', '$window', '$sce', function($timeout, $window, $sce) {

	var AsyncDigest = function(delay) {
		var timeout = null;
		var queue = [];

		this.remove = function(fn) {
			if (queue.indexOf(fn) !== -1) {
				queue.splice(queue.indexOf(fn), 1);
				if (queue.length === 0) {
					$timeout.cancel(timeout);
					timeout = null;
				}
			}
		};
		this.add = function(fn) {
			if (queue.indexOf(fn) === -1) {
				queue.push(fn);
			}
			if (!timeout) {
				timeout = $timeout(function() {
					var copy = queue.slice();
					timeout = null;
					// reset scheduled array first in case one of the functions throws an error
					queue.length = 0;
					copy.forEach(function(fn) {
						fn();
					});
				}, delay);
			}
		};
	};

	var asyncDigestImmediate = new AsyncDigest(0);
	var asyncDigestDebounced = new AsyncDigest(75);

	return {
		restrict: 'A',
		scope: {
			ngShow: '=',
			ngBind: '=',
			ngBindHtml: '=',
			ellipsisAppend: '@',
			ellipsisAppendClick: '&',
			ellipsisSymbol: '@',
			ellipsisSeparator: '@',
			useParent: '@',
			ellipsisUseParent: '@',
			ellipsisSeparatorReg: '=',
			ellipsisMaxLines: '@',
			ellipsisFallbackFontSize: '@'
		},
		compile: function(elem, attr, linker) {

			return function(scope, element, attributes) {
				/* Window Resize Variables */
				attributes.lastWindowResizeTime = 0;
				attributes.lastWindowResizeWidth = 0;
				attributes.lastWindowResizeHeight = 0;
				attributes.lastWindowTimeoutEvent = null;
				/* State Variables */
				attributes.isTruncated = false;

				function _isDefined(value) {
					return typeof(value) !== 'undefined';
				}

				function getParentHeight(element) {
					var heightOfChildren = 0;
					angular.forEach(element.parent().children(), function(child) {
						if (child != element[0]) {
							heightOfChildren += child.clientHeight;
						}
					});
					return element.parent()[0].clientHeight - heightOfChildren;
				}

				function buildEllipsis() {
					var binding = scope.ngBind || scope.ngBindHtml;
					var isTrustedHTML = false;
					if ($sce.isEnabled() && angular.isObject(binding) && $sce.getTrustedHtml(binding)) {
						isTrustedHTML = true;
						binding = $sce.getTrustedHtml(binding);
					}
					if (binding) {
						var isHtml = (!(!!scope.ngBind) && !!(scope.ngBindHtml));
						var i = 0,
							useParent = attributes.ellipsisUseParent || attributes.useParent,
							ellipsisMaxLines = attributes.ellipsisMaxLines,
							ellipsisSymbol = (typeof(attributes.ellipsisSymbol) !== 'undefined') ? attributes.ellipsisSymbol : '&hellip;',
							ellipsisSeparator = (typeof(attributes.ellipsisSeparator) !== 'undefined') ? attributes.ellipsisSeparator : ' ',
							ellipsisSeparatorReg = (typeof(attributes.ellipsisSeparatorReg) !== 'undefined') ? attributes.ellipsisSeparatorReg : new RegExp('[' + ellipsisSeparator + ']+', 'gm'),
							appendString = (typeof(attributes.ellipsisAppend) !== 'undefined' && attributes.ellipsisAppend !== '') ? ellipsisSymbol + "<span class='angular-ellipsis-append'>" + attributes.ellipsisAppend + '</span>' : ellipsisSymbol;

						// Set the text the first time so we can check for overflow
						if (isHtml) {
							element.html(binding);
						} else {
							element.text(binding);
						}

						if (_isDefined(scope.ellipsisFallbackFontSize) && isOverflowed(element, useParent)) {
							element.css('font-size', scope.ellipsisFallbackFontSize);
						}

						if (ellipsisMaxLines) {
							var displayValue = element[0].style.display;

							// You only get line by line rectangles for an 'inline' element
							element[0].style.display = 'inline';

							var fullRectangle = element[0].getBoundingClientRect(),
								lineRectangles = element[0].getClientRects(),
								lineHeight = Math.ceil(fullRectangle.height / lineRectangles.length);

							// Reset styling
							element[0].style.display = displayValue;

							// And now for the party trick
							element[0].style.maxHeight = (lineHeight * scope.ellipsisMaxLines) + 'px';
						}

						// When the text has overflow
						if (isOverflowed(element, useParent)) {
							// Set data-overflow on element for targeting
							element.attr('data-overflowed', 'true');

							var initialMaxHeight = useParent ? getParentHeight(element) : element[0].clientHeight;

							var separatorLocations = [];
							while ((match = ellipsisSeparatorReg.exec(binding)) != null) {
								separatorLocations.push(match.index);
							}

							// We know the text overflows and there are no natural breakpoints so we build a new index
							// With this index it will search for the best truncate location instead of for the best ellipsisSeparator location
							if (separatorLocations.length === 0) {
								var textLength = minimumTruncateLength = 5;
								while (textLength <= binding.length) {
									separatorLocations.push(textLength);
									textLength = textLength * 2;
								}
								separatorLocations.push(binding.length);
							}

							var lowerBound = 0;
							var upperBound = separatorLocations.length - 1;
							var textCutOffIndex;
							// Loop while upper bound and lower bound are not confined to the smallest range yet
							while (true) {
								// This is an implementation of a binary search as we try to find the overflow position as quickly as possible
								textCutOffIndex = lowerBound + ((upperBound - lowerBound) >> 1);
								var isOverflow = fastIsOverflowing(element, getTextUpToIndex(binding, separatorLocations, textCutOffIndex) + appendString, initialMaxHeight);

								if ((upperBound - lowerBound) === 1) {
									break;
								} else {
									if (isOverflow) {
										// The match was in the lower half, excluding the previous upper part
										upperBound = textCutOffIndex;
									} else {
										// The match was in the upper half, excluding the previous lower part
										lowerBound = textCutOffIndex;
									}
								}
							}

							// We finished the search now we set the new text through the correct binding api
							attributes.isTruncated = true;
							if (isHtml) {
								element.html(getTextUpToIndex(binding, separatorLocations, textCutOffIndex) + appendString);
							} else {
								element.text(getTextUpToIndex(binding, separatorLocations, textCutOffIndex)).html(element.html() + appendString);
							}

							// If append string was passed and append click function included
							if (ellipsisSymbol != appendString && typeof(scope.ellipsisAppendClick) !== 'undefined' && scope.ellipsisAppendClick !== '') {
								element.find('span.angular-ellipsis-append').bind("click", function(e) {
									scope.$apply(function() {
										scope.ellipsisAppendClick.call(scope, {
											event: e
										});
									});
								});
							}

							if (!isTrustedHTML && $sce.isEnabled()) {
								$sce.trustAsHtml(binding);
							}
						} else {
							element.attr('data-overflowed', 'false');
						}
					}
				}

				function getTextUpToIndex(binding, separatorLocations, index) {
					return binding.substr(0, separatorLocations[index]);
				}

				function fastIsOverflowing(thisElement, text, initialMaxHeight) {
					// Use innerHTML as it's more performant until we know the correct text length
					thisElement[0].innerHTML = text;
					return thisElement[0].scrollHeight > initialMaxHeight;
				}

				/**
				 *	Test if element has overflow of text beyond height or max-height
				 *
				 *	@param element (DOM object)
				 *
				 *	@return bool
				 *
				 */
				function isOverflowed(thisElement, useParent) {
					thisElement = useParent ? thisElement.parent() : thisElement;
					return thisElement[0].scrollHeight > thisElement[0].clientHeight;
				}

				/**
				 *	Watchers
				 */

				/**
				 *	Execute ellipsis truncate on ngShow update
				 */
				scope.$watch('ngShow', function() {
					asyncDigestImmediate.add(buildEllipsis);
				});

				/**
				 *	Execute ellipsis truncate on ngBind update
				 */
				scope.$watch('ngBind', function() {
					asyncDigestImmediate.add(buildEllipsis);
				});

				/**
				 *	Execute ellipsis truncate on ngBindHtml update
				 */
				scope.$watch('ngBindHtml', function() {
					asyncDigestImmediate.add(buildEllipsis);
				});

				/**
				 *	Execute ellipsis truncate on ngBind update
				 */
				scope.$watch('ellipsisAppend', function() {
					buildEllipsis();
				});

				/**
				 *    Execute ellipsis truncate when element becomes visible
				 */
				scope.$watch(function() {
					return element[0].offsetWidth != 0 && element[0].offsetHeight != 0
				}, function() {
					asyncDigestDebounced.add(buildEllipsis);
				});

				function checkWindowForRebuild() {
					if (attributes.lastWindowResizeWidth != window.innerWidth || attributes.lastWindowResizeHeight != window.innerHeight) {
						buildEllipsis();
					}

					attributes.lastWindowResizeWidth = window.innerWidth;
					attributes.lastWindowResizeHeight = window.innerHeight;
				}

				var unbindRefreshEllipsis = scope.$on('dibari:refresh-ellipsis', function() {
					asyncDigestImmediate.add(buildEllipsis);
				});
				/**
				 *	When window width or height changes - re-init truncation
				 */

				function onResize() {
					asyncDigestDebounced.add(checkWindowForRebuild);
				}

				var $win = angular.element($window);
				$win.bind('resize', onResize);

				/**
				 * Clean up after ourselves
				 */
				scope.$on('$destroy', function() {
					$win.unbind('resize', onResize);
					asyncDigestImmediate.remove(buildEllipsis);
					asyncDigestDebounced.remove(checkWindowForRebuild);
					if (unbindRefreshEllipsis) {
						unbindRefreshEllipsis();
						unbindRefreshEllipsis = null;
					}
				});


			};
		}
	};
}]);
