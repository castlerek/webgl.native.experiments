( function( globalContext, libraryName ) {
    "use strict";

    let libraryContext = new Object();

    function assert( condition, message ) {
        if ( !equal( typeof condition, "boolean" ) )
            throw new Error( "Can't assert the given condition, because it's NOT a type of `boolean`." );

        if ( equal( typeof message, "string" ) && equal( message, "" ) )
            message = "Unhandled exception.";

        if ( !condition )
            throw new Error( message );
    }

    function equal( firstItem, secondItem ) {
        return firstItem === secondItem;
    }

<%= modules %>

    globalContext[ libraryName ] = libraryContext;

})( window, "Engine3D" );