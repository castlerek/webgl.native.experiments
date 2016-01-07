( function( Engine3D ) {

    const $instance    = Symbol( "Shader::Instance" );
    const $type        = Symbol( "Shader::Type" );
    const $source      = Symbol( "Shader::Source" );
    const $initialized = Symbol( "Shader::Initialized" );

    class Shader {
        constructor( type ) {
            handleShaderType.call( this, type );
            this[ $initialized ] = false;
        }

        static get Type() {
            return {
                Fragment : 0,
                Vertex   : 1
            };
        }

        set instance( shader ) {
            assert( shader instanceof WebGLShader,
                "Can't set the given program instance, because it's NOT an instance of `WebGLShader`."
            );

            this[ $instance ] = shader;
        }

        get instance() {
            return this[ $instance ];
        }

        set type( value ) {
            throw new Error( "Property `type` of the shader object is read only." );
        }

        get type() {
            return this[ $type ];
        }

        set source( code ) {
            assert( equal( typeof code, "string" ),
                "Can't set the given source code to the shader, because it's NOT a type of `string`."
            );

            this[ $source ] = code;
        }

        get source() {
            return this[ $source ];
        }

        set initialized( value ) {
            assert( equal( typeof value, "boolean" ),
                "Can't change the value of the `initilized` property, because the given value is NOT a type of `boolean`."
            );

            this[ $initialized ] = value;
        }

        get initialized() {
            return this[ $initialized ];
        }
    }

    function handleShaderType( type ) {
        switch ( type ) {
            case Shader.Type.Vertex:
            case Shader.Type.Fragment:
                this[ $type ] = type;
                break;
            default:
                throw new Error( "Can't create a new instane of the shader class, because the given type is incorrect." );
        }
    }

    Engine3D.Shader = Shader;

})( libraryContext );