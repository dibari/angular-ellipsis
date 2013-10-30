'use strict';

describe("Web App Main Module", function() {
    var module;

    beforeEach(function() {
      module = angular.module("ellipsisApp");
    });

	it("App Module is set", function() {
		expect(module).not.toBe(null);
	});

	describe("Check Module Dependencies", function() {

		var deps,
			hasModule = function(m) {
			return deps.indexOf(m) >= 0;
		};
		beforeEach(function() {
			deps = module.value('Bn').requires;
		});

		it("No dependencies should exist", function() {
			expect(deps).toEqual([]);
		});

	});
});