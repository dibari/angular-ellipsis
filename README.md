angular-ellipsis
================

Angular directive to truncate multi-line text to visible height.  The end of the visible text is appended with an ellipsis and optional text.   
   
To use, copy *angular-ellipsis* to your project and rename the included module (which is set to 'exampleApp' at the bottom) to your own module.

FEATURES
--------
* Works with multi-line text (no HTML)
* On any window resize, truncation and ellipsis will be recalcuated
* Text will only be truncated if there is overflow, otherwise it will display as normal

USAGE
--------
1. Select an HTML element that has a CSS height or max-height value set (max-height will take precedence)
2. Use *ng-bind* on the element to include text to truncate
3. Add the *ellipsis*/*data-ellipsis* directive to the element
4. Text will be truncated to visible area and an ellipsis (...) will be added to the end

*Be sure the HTML element has a height set in CSS*

### Simple example
``<p data-ng-bind="paragraphText" data-ellipsis></p>``   

OPTIONS
--------
* **Add Custom Append**   
You can include a custom string after the ellipsis by adding the *ellipsis-append*/*data-ellipsis-append* attribute to the element, and setting its value to the custom string.  This value may be bound to a scope instead of just being a static string.  The direcive will update the appended text on its update.  Examples:
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more"></p>``   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="scope.appendString"></p>``

* **Add Ellipsis Symbol**   
A custom ellipsis symbol or string can be used.  This value will be appended at the end of the truncated text, before a custom append (if included).  If this value is set, it will replace the ellipsis (...).  Example:
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-symbol="--"></p>``
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more" data-ellipsis-symbol="--"></p>``   

TODO's
--------
* Allow appended text to be wrapped in element (for styling)
* Add option to execute passed function on append click
* Basic option to use a show more/show less functionality for append