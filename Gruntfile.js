module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Copy Angular to examples directory
		copy: {
			main: {
				files: [
					{
						expand: true,
						src: './bower_components/angular/angular.js',
						dest: './examples/js',
						flatten: true,
						filter: 'isFile'
					},
					{
						expand: true,
						src: './bower_components/angular/angular.js',
						dest: './test/assets',
						flatten: true,
						filter: 'isFile'
					},
					{
						expand: true,
						src: './bower_components/jasmine/lib/jasmine-core/jasmine-html.js',
						dest: './test/assets',
						flatten: true,
						filter: 'isFile'
					},
					{
						expand: true,
						src: './bower_components/jasmine/lib/jasmine-core/jasmine.css',
						dest: './test/assets',
						flatten: true,
						filter: 'isFile'
					},
					{
						expand: true,
						src: './bower_components/jasmine/lib/jasmine-core/jasmine.js',
						dest: './test/assets',
						flatten: true,
						filter: 'isFile'
					}
				]
			}
		},

		// Minify all JS files
		uglify: {
			my_target: {
				files: {
					'src/angular-ellipsis.min.js': [
						'src/angular-ellipsis.js'
					]
				}
			}
		},

		// JS Hint
		jshint: {
			options : {
				"smarttabs": true
			},
			all : [
				'src/angular-ellipsis.js'
			]
		}

	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['copy', 'jshint', 'uglify']);

};