( function( Engine3D ) {

    const $data        = Symbol( "Mesh::Data" );
    const $position    = Symbol( "Matrix::Position" );
    const $initialized = Symbol( "Mesh::Initialized" );

    class Mesh {
        constructor() {
            this[ $data ] = new Map();
            this[ $position ] = new Engine3D.Vector3();
            this[ $initialized ] = false;
        }

        static get VertexType() {
            return {
                Position : 0,
                Color    : 1
            }
        }

        set position( newPosition ) {
            assert( newPosition instanceof Engine3D.Vector3,
                "Can't set the position of the mesh object, because the given position is NOT an instance of `Engine3D.Vector3`."
            );

            this[ $position ] = newPosition;
        }

        get position() {
            return this[ $position ];
        }

        setVertexData( type, data ) {
            assert( data instanceof Float32Array,
                "Can't set the vertex data, because the given data is NOT an instance of `Float32Array`."
            );

            assert( !equal( data.length, 0 ),
                "Can't set the vertex data, because the length of the given data equals zero."
            );

            handleVertexData.call( this, type, data );
        }

        getVertexData( type ) {
            return fetchVertexData.call( this, type );
        }

        setBufferData( type, buffer ) {
            assert( buffer instanceof Engine3D.Buffer,
                "Can't save the given buffer to the mesh object, because the given buffer is NOT an instance of `Engine3D.Buffer`."
            );

            handleBufferData.call( this, type, buffer );
        }

        getBufferData( type ) {
            return fetchBufferData.call( this, type );
        }
    }

    function handleVertexData( type, data ) {
        switch ( type ) {
            case Mesh.VertexType.Position:
                this[ $data ].set( "vertex.position", data );
                break;
            case Mesh.VertexType.Color:
                this[ $data ].set( "vertex.color", data );
                break;
            default:
                throw new Error( "Can't handle the given vertex data, because the given data type is incorrect." );
        }
    }

    function fetchVertexData( type ) {
        let data = null;

        switch ( type ) {
            case Mesh.VertexType.Position:
                data = this[ $data ].get( "vertex.position" );
                break;
            case Mesh.VertexType.Color:
                data = this[ $data ].get( "vertex.color" );
                break;
            default:
                throw new Error( "Can't fetch the saved vertex data, because the given type is incorrect." );
        }

        return data;
    }

    function handleBufferData( type, buffer ) {
        switch ( type ) {
            case Mesh.VertexType.Position:
                this[ $data ].set( "webgl.buffer.position", buffer );
                break;
            case Mesh.VertexType.Color:
                this[ $data ].set( "webgl.buffer.color", buffer );
                break;
            default:
                throw new Error( "Can't handle the given buffer data, because the given data type is incorrect." );
        }
    }

    function fetchBufferData( type ) {
        let data = null;

        switch ( type ) {
            case Mesh.VertexType.Position:
                data = this[ $data ].get( "webgl.buffer.position" );
                break;
            case Mesh.VertexType.Color:
                data = this[ $data ].get( "webgl.buffer.color" );
                break;
            default:
                throw new Error( "Can't fetch the saved buffer data, because the given type is incorrect." );
        }

        return data;
    }

    Engine3D.Mesh = Mesh;

})( libraryContext );