( function( Engine3D ) {

    const $instance = Symbol( "Program::Instance" );
    const $context  = Symbol( "Program::Context" );
    const $shaders  = Symbol( "Program::Shaders" );

    class Program {
        constructor( context ) {
            assert( context instanceof WebGLRenderingContext,
                "Can't create a new instance of the program class, because the given context is NOT an instance of `WebGLRenderingContext`."
            );

            this[ $shaders  ] = new Map();
            this[ $instance ] = context.createProgram();
            this[ $context  ] = context;
        }

        set instance( program ) {
            assert( program instanceof WebGLProgram,
                "Can't set the given program instance, because it's NOT an instance of `WebGLProgram`."
            );

            this[ $instance ] = program;
        }

        get instance() {
            return this[ $instance ];
        }

        addShader( shader ) {
            assert( shader instanceof Engine3D.Shader,
                "Can't add the given shader to the program map, because the given shader is NOT an instance of `Engine3D.Shader`."
            );

            if ( !shader.initialized ) {
                handleShaderSource.call( this, shader );
                saveShaderObjectToMap.call( this, shader );
                shader.initialized = true;
            }
        }

        getAttachedShaders() {
            let shaders = this[ $context ].getAttachedShaders( this[ $instance ] );

            return ( equal( shaders, undefined ) || equal( shaders.length, 0 ) )
                ? null
                : shaders;
        }

        createBuffer( type, data ) {
            let buffer = new Engine3D.Buffer( type, data );
            initializeWebglBuffer.call( this, buffer );
            return buffer;
        }

        updateUniform( name, data ) {
            assert( equal( typeof name, "string" ),
                "Can't update the uniform value, because the given name is NOT a type of `string`."
            );

            assert( data instanceof Float32Array,
                "Can't update the uniform value, because the given data is NOT an instance of `Float32Array`."
            );

            handleUniformValue.call( this, name, data );
        }

        compile() {
            checkAttachedShaders.call( this );
            linkWebglProgram.call( this );
            enableAttributes.call( this );
        }
    }

    function handleShaderSource( shader ) {
        let context = this[ $context ];

        if ( equal( shader.instance, undefined ) ) {
            switch ( shader.type ) {
                case Engine3D.Shader.Type.Vertex:
                    shader.instance = context.createShader( context.VERTEX_SHADER );
                    break;
                case Engine3D.Shader.Type.Fragment:
                    shader.instance = context.createShader( context.FRAGMENT_SHADER );
                    break;
                default:
                    throw new Error( "Can't handle the given shader object, because its type is incorrect." );
            }
        }

        context.shaderSource( shader.instance, shader.source );
        context.compileShader( shader.instance );

        if ( !context.getShaderParameter( shader.instance, context.COMPILE_STATUS ) )
            throw new Error( "Shader wasn't compiled successfully, error log: " + context.getShaderInfoLog( shader.instance ) );
    }

    function saveShaderObjectToMap( shader ) {
        switch ( shader.type ) {
            case Engine3D.Shader.Type.Vertex:
                this[ $shaders ].set( "shader.vertex", shader );
                break;
            case Engine3D.Shader.Type.Fragment:
                this[ $shaders ].set( "shader.fragment", shader );
                break;
            default:
                throw new Error( "Can't add the given shader to the program map, because the type of the given shader is incorrect." );
        }
    }

    function initializeWebglBuffer( buffer ) {
        assert( buffer instanceof Engine3D.Buffer,
            "Can't initialize a new instance of the `WebGLBuffer`, because the given managed buffer is NOT an instance of `Engine3D.Buffer`."
        );

        let context = this[ $context ];
        let webglBuffer = context.createBuffer();

        switch ( buffer.type ) {
            case Engine3D.Buffer.Type.Vertex:
                context.bindBuffer( context.ARRAY_BUFFER, webglBuffer );
                context.bufferData( context.ARRAY_BUFFER, buffer.data, context.DYNAMIC_DRAW );
                break;
            case Engine3D.Buffer.Type.Index:
                context.bindBuffer( context.ELEMENT_ARRAY_BUFFER, webglBuffer );
                context.bufferData( context.ELEMENT_ARRAY_BUFFER, buffer.data, context.DYNAMIC_DRAW );
                break;
            default:
                throw new Error( "Can't initialize a new instance of the `WebGLBuffer`, because the type of the managed buffer isn't correct." );
        }

        buffer.instance = webglBuffer;
    }

    function checkAttachedShaders() {
        let vertexShader   = this[ $shaders ].get( "shader.vertex" );
        let fragmentShader = this[ $shaders ].get( "shader.fragment" );

        assert( vertexShader instanceof Engine3D.Shader,
            "Can't attach the vertex shader to the WebGL program, because it's undefined."
        );

        assert( fragmentShader instanceof Engine3D.Shader,
            "Can't attach the fragment shader to the WebGL program, because it's undefined."
        );

        assert( vertexShader.instance instanceof WebGLShader,
            "Can't attach the vertex shader to the WebGL program, because its associated WebGL object is NOT an instance of `WebGLShader`."
        );

        assert( fragmentShader.instance instanceof WebGLShader,
            "Can't attach the fragment shader to the WebGL program, because its associated WebGL object is NOT an instance of `WebGLShader`."
        );
    }

    function linkWebglProgram() {
        let context = this[ $context ];
        let program = this[ $instance ];

        let vertexShader   = this[ $shaders ].get( "shader.vertex" );
        let fragmentShader = this[ $shaders ].get( "shader.fragment" );

        context.attachShader( program, vertexShader.instance );
        context.attachShader( program, fragmentShader.instance );
        context.linkProgram( program );

        if ( !context.getProgramParameter( program, context.LINK_STATUS ) ) {
            let errorLog = context.getProgramInfoLog( program );
            context.deleteProgram( program );
            throw new Error( "Error occured, when was trying to link the WebGL program, reason: " + errorLog );
        }

        context.useProgram( program );
    }

    function enableAttributes() {
        let context = this[ $context ];
        let program = this[ $instance ];

        let positionAttribute = context.getAttribLocation( program, "vertexPosition" );
        let colorAttribute    = context.getAttribLocation( program, "vertexColor" );

        context.enableVertexAttribArray( positionAttribute );
        context.enableVertexAttribArray( colorAttribute );
    }

    function handleUniformValue( name, data ) {
        let context  = this[ $context ];
        let program  = this[ $instance ];
        let location = context.getUniformLocation( program, name );

        assert( location instanceof WebGLUniformLocation,
            "Can't update the uniform value in shader, because the fetched location is NOT an instance of `WebGLUniformLocation`."
        );

        context.uniformMatrix4fv( location, false, data );
    }

    Engine3D.Program = Program;

})( libraryContext );