( function( Engine3D ) {

    class Mathematics {
        static convertDegreesToRadians( degrees ) {
            assert( equal( typeof degrees, "number" ),
                "Can't convert to given degrees value to the radians, because the given value is NOT a type of `number`."
            );

            return degrees * Math.PI / 180.0;
        }
    }

    Engine3D.Math = Mathematics;

})( libraryContext );