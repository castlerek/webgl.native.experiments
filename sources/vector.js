( function( Engine3D ) {

    const $x = Symbol( "Vector3::X" );
    const $y = Symbol( "Vector3::Y" );
    const $z = Symbol( "Vector3::Z" );

    class Vector3 {
        constructor( x, y, z ) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

        set x( value ) {
            assert( equal( typeof value, "number" ),
                "Can't set the `x` value of the vector object, because the given value is NOT a type of `number`."
            );

            this[ $x ] = value;
        }

        get x() {
            return this[ $x ];
        }

        set y( value ) {
            assert( equal( typeof value, "number" ),
                "Can't set the `y` value of the vector object, because the given value is NOT a type of `number`."
            );

            this[ $y ] = value;
        }

        get y() {
            return this[ $y ];
        }

        set z( value ) {
            assert( equal( typeof value, "number" ),
                "Can't set the `z` value of the vector object, because the given value is NOT a type of `number`."
            );

            this[ $z ] = value;
        }

        get z() {
            return this[ $z ];
        }
    }

    function handleInputArguments( x, y, z ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Engine3D.Vector3 = Vector3;

})( libraryContext );