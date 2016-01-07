( function( globalContext ) {
    "use strict";

    let fs       = require( "fs" );
    let gulp     = require( "gulp" );
    let concat   = require( "gulp-concat" );
    let template = require( "gulp-template" );
    let rename   = require( "gulp-rename" );
    let indent   = require( "gulp-indent" );
    let eol      = require( "gulp-eol" );

    const sourcesPath      = "sources/";
    const outputPath       = "build/";
    const templatePath     = "templates/";
    const templateFilename = "debug.tpl";
    const outputFilename   = "engine3d.js"

    gulp.task( "build.project", function() {
        return gulp.src( sourcesPath + "*.js" )
        .pipe( eol() )
        .pipe( concat( outputFilename ) )
        .pipe( indent({ tabs: false, amount: 4 }) )
        .pipe( gulp.dest( outputPath ) );
    });

    gulp.task( "handle.template", [ "build.project" ], function() {
        fs.readFile( outputPath + outputFilename, "utf8", function( error, data ) {
            if ( error )
                throw new Error( error );

            return gulp.src( templatePath + templateFilename )
            .pipe( template({ modules: data }) )
            .pipe( rename( outputFilename ) )
            .pipe( gulp.dest( outputPath ) );
        });
    });

    gulp.task( "default", [ "handle.template" ] );

})( this );