( function( Engine3D ) {

    const $instance = Symbol( "Buffer::Instance" );
    const $type     = Symbol( "Buffer::Type" );
    const $data     = Symbol( "Buffer::Data" );
    const $size     = Symbol( "Buffer::Size" );
    const $count    = Symbol( "Buffer::Count" );

    class Buffer {
        constructor( type, data ) {
            handleBufferType.call( this, type );
            handleBufferData.call( this, data );
        }

        static get Type() {
            return {
                Vertex : 0,
                Index  : 1
            };
        }

        set instance( buffer ) {
            assert( buffer instanceof WebGLBuffer,
                "Can't set the raw instance of the current buffer object, because the given buffer is NOT an instance of `WebGLBuffer`."
            );

            this[ $instance ] = buffer;
        }

        get instance() {
            return this[ $instance ];
        }

        get type() {
            return this[ $type ];
        }

        get data() {
            return this[ $data ];
        }

        get size() {
            return this[ $size ];
        }

        set size( value ) {
            assert( equal( typeof value, "number" ),
                "Can't set the `size` property of the buffer object, because the given value is NOT a type of `number`."
            );

            this[ $size ] = value;
        }

        get count() {
            return this[ $count ];
        }

        set count( value ) {
            assert( equal( typeof value, "number" ),
                "Can't set the `cout` property of the buffer object, because the given value is NOT a type of `number`."
            );

            this[ $count ] = value;
        }
    }

    function handleBufferType( type ) {
        switch ( type ) {
            case Buffer.Type.Vertex:
            case Buffer.Type.Index:
                this[ $type ] = type;
                break;
            default:
                throw new Error( "Can't handle the given buffer type, because it's incorrect." );
        }
    }

    function handleBufferData( data ) {
        assert( data instanceof Float32Array,
            "Can't create a new instance of the buffer class, because the given data is NOT an instance of `Float32Array`."
        );

        assert( !equal( data.length, 0 ),
            "Can't create a new instance of the buffer class, because the length of the given data equals zero."
        );

        this[ $data ] = data;
    }

    Engine3D.Buffer = Buffer;

})( libraryContext );