'use strict';
/*global require:true, module:false*/
module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var framework7 = {
        filename: 'framework7'
    };

    // List of js files to concatenate
    var jsFilesList = [
        'src/js/wrap-start.js',
        'src/js/f7-intro.js',
        'src/js/views.js',
        'src/js/navbars.js',
        'src/js/searchbar.js',
        'src/js/xhr.js',
        'src/js/pages.js',
        'src/js/modals.js',
        'src/js/panels.js',
        'src/js/messages.js',
        'src/js/swipeout.js',
        'src/js/sortable.js',
        'src/js/smart-select.js',
        'src/js/pull-to-refresh.js',
        'src/js/infinite-scroll.js',
        'src/js/tabs.js',
        'src/js/fast-clicks.js',
        'src/js/clicks.js',
        'src/js/resize.js',
        'src/js/forms-handler.js',
        'src/js/push-state.js',
        'src/js/slider.js',
        'src/js/photo-browser.js',
        'src/js/notifications.js',
        'src/js/plugins.js',
        'src/js/init.js',
        'src/js/f7-outro.js',
        'src/js/dom.js',
        'src/js/dom-utils.js',
        'src/js/dom-ajax.js',
        'src/js/dom-export.js',
        'src/js/proto-support.js',
        'src/js/proto-device.js',
        'src/js/proto-plugins.js',
        'src/js/wrap-end.js'
    ];

    // Project configuration.
    grunt.initConfig({
        framework7: framework7,
        // Metadata.
        pkg: grunt.file.readJSON('bower.json'),
        banner: '/*\n' +
            ' * <%= pkg.name %> <%= pkg.version %>\n' +
            ' * <%= pkg.description %>\n' +
            ' *\n' +
            ' * <%= pkg.homepage %>\n' +
            ' *\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
            ' * The iDangero.us\n' +
            ' * http://www.idangero.us/\n' +
            ' *\n' +
            ' * Licensed under <%= pkg.license.join(" & ") %>\n' +
            ' *\n' +
            ' * Released on: <%= grunt.template.today("mmmm d, yyyy") %>\n' +
            '*/\n',

        // Task configuration.
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: ''
                }
            }
        },
        open: {
            dist: {
                path: 'http://localhost:3000/dist'
            }
        },
        less: {
            dist: {
                options: {
                    paths: ['less'],
                    cleancss: true
                },
                files: {
                    'dist/css/framework7.min.css' : ['src/less/framework7.less']
                }
            },

        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false,
                process: function (src, filename) {
                    if (filename.indexOf('.js') >= 0) {
                        var addIndent = '        ';
                        filename = filename.replace('src/js/', '');
                        if (filename === 'wrap-start.js' || filename === 'wrap-end.js') {
                            addIndent = '';
                        }
                        if (filename === 'f7-intro.js' || filename === 'f7-outro.js' || filename.indexOf('dom') >= 0 || filename.indexOf('proto') >= 0) addIndent = '    ';
                        src = grunt.util.normalizelf(src);
                        return src.split(grunt.util.linefeed).map(function (line) {
                            return addIndent + line;
                        }).join(grunt.util.linefeed);
                    }
                    else return src;
                }
            },
            js: {
                src: jsFilesList,
                dest: 'build/js/<%= framework7.filename %>.js'
            },
            css_build: {
                src: ['build/css/<%= framework7.filename %>.css'],
                dest: 'build/css/<%= framework7.filename %>.css'
            },
            css_dist: {
                src: ['dist/css/<%= framework7.filename %>.min.css'],
                dest: 'dist/css/<%= framework7.filename %>.min.css'
            },
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: ['dist/js/<%= framework7.filename %>.js'],
                dest: 'dist/js/<%= framework7.filename %>.min.js',
            },
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: ['Gruntfile.js', 'build/js/framework7.js']
            }
        },
        
        watch: {
        	
        },

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'build/',
                        src: ['**'],
                        dest: 'dist/'
                    }
                ]
            },
        },
    });

    // Default task.
    this.registerTask('default', ['dist']);

    // Release
    this.registerTask('dist', 'Builds a distributable version of <%= pkg.name %>', [
        'concat:js',
        'less:build',
        'less:dist',
        'concat:css_build',
        'concat:css_dist',
        'jshint',
        'copy:build',
        'jade:build',
        'copy:dist',
        'uglify:dist'
    ]);

    // Server
    this.registerTask('server', 'Run server', [
        'connect',
        'open',
        'watch'
    ]);

};
