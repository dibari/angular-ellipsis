angular-ellipsis
================

Angular directive to truncate multi-line text to visible height.  The end of the visible text is appended with an ellipsis, optional text, and optional click callback function.
   
To use, copy *src/angular-ellipsis.js* to your project and rename the included module (which is set to 'exampleApp' at the bottom) to your own module.

Or, to install via Bower:
```javascript
bower install angular-ellipsis
```
and then inject into your app:
```javascript
var myApp = angular.module('myApp', ['dibari.angular-ellipsis']);
```

DEMO
--------
[Angular Ellipsis Directive demo page](http://dibari.github.io/angular-ellipsis.html "Angular Ellipsis Directive")

FEATURES
--------
* Truncates multi-line text (no HTML)
* On any window resize, truncation and ellipsis will be recalcuated
* Text will only be truncated if there is overflow, otherwise it will display as normal
* Custom ellipsis append text will live-update (if a $scope variable is used)

BASIC USAGE
--------
1. Select an HTML element that has a CSS height or max-height value set (max-height will take precedence)
2. Use *ng-bind* on the element to include text to truncate
3. Add the *ellipsis*/*data-ellipsis* directive to the element
4. Text will be truncated to visible area, and an ellipsis (...) will be added to the end

### Simple example
``<p data-ng-bind="paragraphText" data-ellipsis></p>``   

OPTIONS
--------
* **Custom Ellipsis Symbol**   
A custom ellipsis string can be used.  If this value is set, it will replace the default ellipsis (...).  This value will be appended at the end of the truncated text, before a custom append (if included).  Example:   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-symbol="--"></p>``   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more" data-ellipsis-symbol="--"></p>``   

* **Custom Append Text**   
You can include a custom string after the ellipsis by setting the attribute *ellipsis-append*/*data-ellipsis-append* on the element.  This value may be bound to a scope variable instead of just being a static string.  If a scope value is used, the direcive will update the appended text on its update.  Only text may be used, not HTML.  When rendered in the truncated text, this custom string wrapped in a *span* tag, and can be styled through CSS as usual.  Examples:   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more"></p>``   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="scope.appendString"></p>``   

* **Custom Append Text Click Function**   
If a custom append string is included, a function can be executed on the resulting span tag's click.  The function must exist within the controller's scope.  If an ellipsis append string is not included, the function will not execute (since it has no element to bind to).  Example:   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more" data-ellipsis-append-click="onClickFunction()"></p>``   

* **Custom String Separator**
You can use string separator to split the string by something else than " " (space). Example (split by characters):
``<p data-ng-bind="paragraphText" data-ellipsis data-separator=""></p>``

* **Fallback Font-Size**
You can specify a fallback font size.  If text is detected to overflow an attempt to resize the text to the fallback font-size will be made before ellipsis are added.
``<p data-ng-bind="paragraphText" data-ellipsis data.ellipsis-falback-font-size="90%"></p>``

COMPATIBILITY
--------
Works on modern web browers, which includes any relatively recent version of Chrome, Firefox, Safari, and IE 9+.  Although there is no formally-maintained list, mobile device support is quite thorough.  I will update cross-browser and device issues if they are entered as issues.   
* To make the plugin work in non-modern versions of Internet Explorer, be sure to review the [Angular Internet Explorer Compatibility page](http://docs.angularjs.org/guide/ie).  This [StackOverflow question](http://stackoverflow.com/questions/18506458/sceiequirks-strict-contextual-escaping-does-not-support-internet-explorer-ve) regarding the [Angular $sce service](http://docs.angularjs.org/api/ng.$sce) addresses an issue with the ng-bind directive.   
* One suggested use case for < IE 8 implementation is to maintain an additional non-truncated element with overflow set to hidden.  Using IE conditional CSS, the truncated element can be displayed to IE 8 and above, and the non-truncated version to < IE 8.

TODO's
--------
* Add option to execute passed function on append click
* Basic option to use a show more/show less functionality for append
