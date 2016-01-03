( function( Engine3D ) {

    const $data = Symbol( "Matrix::Data" );
    const defaultCapicity = 16;

    class Matrix4 {
        constructor() {
            this[ $data ] = new Float32Array( defaultCapicity );
        }

        set data( newData ) {
            assert( newData instanceof Float32Array,
                "Can't set the data of the matrix object, because the given new data is NOT an instance of `Float32Array`."
            );

            assert( !equal( newData.length, defaultCapicity ),
                "Can't set the data of the matrix object, because the length of the given new data is NOT equal `16`."
            );

            this[ $data ] = newData;
        }

        get data() {
            return this[ $data ];
        }

        toIdentity() {
            for ( let i = 0; i < this.data.length; i++ ) {
                switch ( i ) {
                    case 0:
                    case 5:
                    case 10:
                    case 15:
                        this[ $data ][ i ] = 1.0;
                        break;
                    default:
                        this[ $data ][ i ] = 0.0;
                        break;
                }
            }

            return this.data;
        }

        toPerspective( fovY, aspect, near, far ) {
            assert( equal( typeof fovY, "number" ),
                "Can't convert current matrix to the perspective one, because the given `fovY` is NOT a type of `number`."
            );

            assert( equal( typeof aspect, "number" ),
                "Can't convert current matrix to the perspective one, because the given `aspect` is NOT a type of `number`."
            );

            assert( equal( typeof near, "number" ),
                "Can't convert current matrix to the perspective one, because the given `near` is NOT a type of `number`."
            );

            assert( equal( typeof far, "number" ),
                "Can't convert current matrix to the perspective one, because the given `fat` is NOT a type of `number`."
            );

            handlePerspectiveConversion.call( this, fovY, aspect, near, far );
            return this.data;
        }

        translate( vector ) {
            assert( vector instanceof Engine3D.Vector3,
                "Can't translate the matrix by the given vector, because it's NOT an instance of `Engine3D.Vector3`."
            );

            handleMatrixTranslation.call( this, vector );
            return this.data;
        }

        rotate( axis, angle ) {
            assert( equal( typeof axis, "string" ),
                "Can't rotate the matrix, because the given axis value is NOT a type of `string`."
            );

            assert( equal( typeof angle, "number" ),
                "Can't rotate the matrix, because the given angle is NOT a type of `number`."
            );

            handleMatrixRotation.call( this, axis, angle );
            return this.data;
        }
    }

    function handlePerspectiveConversion( fovY, aspect, near, far ) {
        let data   = this[ $data ];
        let yScale = 1.0 / Math.tan( fovY / 2.0 );
        let xScale = yScale / aspect;

        for ( let i = 0; i < data.length; i++ ) {
            switch ( i ) {
                case 0:
                    data[ i ] = xScale;
                    break;
                case 5:
                    data[ i ] = yScale;
                    break;
                case 10:
                    data[ i ] = -( far + near ) / ( far - near );
                    break;
                case 11:
                    data[ i ] = -1.0;
                    break;
                case 14:
                    data[ i ] = -2.0 * far * near / ( far - near );
                    break;
                default:
                    data[ i ] = 0.0;
                    break;
            }
        }
    }

    function handleMatrixTranslation( vector ) {
        let data  = this[ $data ];
        let count = ( a, b, c, d ) => {
            return a * vector.x + b * vector.y + c * vector.z + d;
        };

        data[ 12 ] = count( data[ 0 ], data[ 4 ], data[ 8  ], data[ 12 ] );
        data[ 13 ] = count( data[ 1 ], data[ 5 ], data[ 9  ], data[ 13 ] );
        data[ 14 ] = count( data[ 2 ], data[ 6 ], data[ 10 ], data[ 14 ] );
        data[ 15 ] = 1.0;
    }

    function handleMatrixRotation( axis, angle ) {
        let radians   = Engine3D.Math.convertDegreesToRadians( angle );
        let sinAlpha  = Math.sin( radians );
        let cosAlpha  = Math.cos( radians );

        let rotations = {
            x: () => {
                this[ $data ][ 5 ] =  cosAlpha; this[ $data ][ 6  ] = sinAlpha;
                this[ $data ][ 9 ] = -sinAlpha; this[ $data ][ 10 ] = cosAlpha;
            },
            y: () => {
                this[ $data ][ 0 ] = cosAlpha; this[ $data ][ 2  ] = -sinAlpha;
                this[ $data ][ 8 ] = sinAlpha; this[ $data ][ 10 ] =  cosAlpha;
            },
            z: () => {
                this[ $data ][ 0 ] =  cosAlpha; this[ $data ][ 1 ] = sinAlpha;
                this[ $data ][ 4 ] = -sinAlpha; this[ $data ][ 5 ] = cosAlpha;
            }
        };

        switch ( axis.toLowerCase() ) {
            case "x":
                rotations.x();
                break;
            case "y":
                rotations.y();
                break;
            case "z":
                rotations.z();
                break;
            default:
                throw new Error( "Can't handle the matrix rotation, because the given axis value has an incorrect value." );
        }
    }

    Engine3D.Matrix4 = Matrix4;

})( libraryContext );