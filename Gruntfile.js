'use strict';
module.exports = function (grunt) {
	// Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist'
    };

	grunt.initConfig({
		config:config,

		watch: {
			bower: {
				files: ['bower.json'],
				tasks: ['wiredep']
			},
			js: {
				files: ['<%= config.app %>/js/{,*/}*.js'],
				tasks: ['jshint', 'copy:js'],
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:gruntfile']
			},
			styles: {
				files: ['<%= config.app %>/css/{,*/}*.scss'],
				tasks: ['sass'],
			},
			jade: {
				files: ['<%= config.app %>/{,*/}*.jade'],
				tasks:['jade']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.app %>/**'
				]
			}
		},

		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				hostname: 'localhost'
			},
			debug: {
				options: {
					base: [
						'<%= config.dist %>',
						'.'//TODO: copy deps to dist directory
                    ]
				}
			}

		},

		jshint: {
			options: {
				//reporter: require('jshint-stylish')
				newcap: false
			},
			gruntfile: {
				options: {
					node:true
				},
				src: 'Gruntfile.js'
			},
			src: {
				src: ['<%= config.app %>/js/{,*/}*.js']
			}
		},
		copy: {
            js: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        'js/{,*/}*.js',
                    ]
                }]
            },
			misc: {
				src: 'data.json',
				dest: '<%= config.dist %>/'
			}
		},

		clean: {
			src: {
				src: ['<%= config.dist %>/*', '<%= config.dist %>/../.sass-cache']
			}
		},

		wiredep: {
			options: {
				dependencies: true,
				devDependencies: true,
			},
			src: {
				src: ['<%= config.app %>/{,*/}*.jade']
			}
		},
		jade : {
			options: {
				pretty:true
			},
			src: {
				expand: true,     // Enable dynamic expansion.
				cwd: '<%= config.app %>',      // Src matches are relative to this path.
				src: ['{,*/}*.jade'],
				dest: '<%= config.dist %>/',   // Destination path prefix.
				ext: '.html',   // Dest filepaths will have this extension.
				extDot: 'first'
			}
		},
		sass : {
			options: {
			},
			src: {
				expand: true,     // Enable dynamic expansion.
				cwd: '<%= config.app %>',      // Src matches are relative to this path.
				src: ['css/{,*/}*.scss'],
				dest: '<%= config.dist %>/',   // Destination path prefix.
				ext: '.css',   // Dest filepaths will have this extension.
				extDot: 'first'
			}
		},
		'gh-pages': {
			options: {
				base: '<%= config.dist %>'
			},
			src: ['**']
		}
	});

	grunt.registerTask('debug', 'Watch files and run webserver on 9000 port', function () {
        grunt.task.run([
            'newer:jshint',
			//'wiredep',
			'newer:jade',
			'newer:sass',
			'newer:copy:js',
            'connect',
            'watch'
        ]);
    });

	grunt.registerTask('build', 'Build project in app->dist', function () {
        grunt.task.run([
            'newer:jshint',
			//'wiredep',
			'jade',
			'sass',
			'copy:js',
        ]);
    });


};
