angular-ellipsis
================

Angular directive to truncate multi-line text to visible height.  The end of the visible text will be appended with an ellipsis, and optional text.

Example
--------
``<p data-ng-bind="paragraphText" data-ellipsis style="height: 20px;"></p>``   
*CSS style shown inline for example only*

Getting Started
--------
1. Select an HTML element that has CSS height value set
2. Use *ng-bind* on the element to include text to truncate
3. Add the *ellipsis*/*data-ellipsis* directive to the element
4. Text will be truncated to visible area and an ellipsis (...) will be added to the end

Options and Parameters
--------
* **Add Custom Append**   
You can include a custom string after the ellipsis by adding the *ellipsis-append*/*data-ellipsis-append* attribute to the element, and setting its value to the custom string.  For example:   
``<p data-ng-bind="paragraphText" data-ellipsis data-ellipsis-append="read more"></p>``

Features
--------
* On any window resize, the truncation will be recalcuated