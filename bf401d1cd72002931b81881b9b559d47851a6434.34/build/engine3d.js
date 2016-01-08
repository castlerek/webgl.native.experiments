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

    ( function( Engine3D ) {

        const $canvas  = Symbol( "Renderer::Canvas" );
        const $context = Symbol( "Renderer::Context" );
        const $program = Symbol( "Renderer::Program" );
        const $scene   = Symbol( "Renderer::Scene" );

        class Renderer {
            constructor( domId ) {
                if ( domId )
                    this.setCanvas( domId );
            }

            setCanvas( domId ) {
                assert( equal( typeof domId, "string" ),
                    "Can't create a new instance of `Renderer` class, because the given `domId` is NOT a type of `string`."
                );

                this[ $canvas ] = document.getElementById( domId );

                assert( this[ $canvas ] instanceof HTMLCanvasElement,
                    "Can't create a new instance of `Renderer` class, because the fetched DOM element is NOT an instance of `HTMLCanvasElement`."
                );

                let methods = [
                    createWebglContext,
                    initializeWebglProgram,
                    prepapreShaders,
                    resizeCanvasElement,
                    registerDomResizeEvent
                ];

                for ( let item of methods )
                    item.call( this );
            }

            setActiveScene( scene ) {
                assert( scene instanceof Engine3D.Scene,
                    "Can't set the given scene as the active one, because it's NOT an instance of `Engine3D.Scene`."
                );

                this[ $scene ] = scene;
            }

            getActiveScene() {
                return this[ $scene ];
            }

            render() {
                drawFrame.call( this );
            }
        }

        function createWebglContext() {
            this[ $context ] = this[ $canvas ].getContext( "webgl", {
                alpha     : true,
                antialias : true,
                depth     : true,
                stencil   : true
            });

            assert( this[ $context ] instanceof WebGLRenderingContext,
                "The WebGL context wasn't successfully created."
            );
        }

        function initializeWebglProgram() {
            let program = new Engine3D.Program( this[ $context ] );
            this[ $program ] = program;
        }

        function prepapreShaders() {
            let program = this[ $program ];
            let vertexShader   = new Engine3D.Shader( Engine3D.Shader.Type.Vertex );
            let fragmentShader = new Engine3D.Shader( Engine3D.Shader.Type.Fragment );

            vertexShader.source = "\
                attribute vec3 vertexPosition;\
                attribute vec4 vertexColor;\
                varying vec4 fragmentColor;\
                uniform mat4 modelMatrix;\
                uniform mat4 viewMatrix;\
                uniform mat4 perspectiveMatrix;\
                \
                void main( void ) {\
                    fragmentColor = vertexColor;\
                    gl_Position = perspectiveMatrix * modelMatrix * viewMatrix * vec4( vertexPosition, 1.0 );\
                }\
            ";

            fragmentShader.source = "\
                precision highp float;\
                varying vec4 fragmentColor;\
                \
                void main( void ) {\
                    gl_FragColor = fragmentColor;\
                }\
            ";

            program.addShader( vertexShader );
            program.addShader( fragmentShader );
            program.compile();
        }

        function drawFrame() {
            let gl = this[ $context ];
            gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
            gl.viewport( 0, 0, this[ $canvas ].width, this[ $canvas ].height );

            let scene = this.getActiveScene();

            if ( scene instanceof Engine3D.Scene )
                handleSceneObjects.call( this, scene );

            globalContext.requestAnimationFrame( drawFrame.bind( this ) );
        }

        function handleSceneObjects( scene ) {
            let viewMatrix = new Engine3D.Matrix4();
            viewMatrix.toIdentity();

            let projectionMatrix = new Engine3D.Matrix4();
            projectionMatrix.toPerspective(
                45.0,
                this[ $canvas ].width / this[ $canvas ].height,
                0.1,
                10000
            );

            this[ $program ].updateUniform( "perspectiveMatrix", projectionMatrix.data );
            this[ $program ].updateUniform( "viewMatrix", viewMatrix.data );

            for ( let item of scene.children ) {
                if ( item instanceof Engine3D.Mesh ) {
                    if ( !item.initialized )
                        initializeMeshObject.call( this, item );

                    handleMeshObject.call( this, item );
                }
            }
        }

        function handleMeshObject( mesh ) {
            let context = this[ $context ];
            let program = this[ $program ];
            let modelMatrix = new Engine3D.Matrix4();
            modelMatrix.toIdentity();
            modelMatrix.translate( mesh.position );

            let buffers = {
                postion : mesh.getBufferData( Engine3D.Mesh.VertexType.Position ),
                color   : mesh.getBufferData( Engine3D.Mesh.VertexType.Color )
            };

            handleMeshBuffers( context, program.instance, buffers );
            program.updateUniform( "modelMatrix", modelMatrix.data );
            context.drawArrays( context.TRIANGLES, 0, buffers.postion.count );
        }

        function handleMeshBuffers( context, program, buffers ) {
            context.bindBuffer( context.ARRAY_BUFFER, buffers.postion.instance );
            context.vertexAttribPointer(
                context.getAttribLocation( program, "vertexPosition" ),
                buffers.postion.size,
                context.FLOAT,
                false,
                0,
                0
            );

            context.bindBuffer( context.ARRAY_BUFFER, buffers.color.instance );
            context.vertexAttribPointer(
                context.getAttribLocation( program, "vertexColor" ),
                buffers.color.size,
                context.FLOAT,
                false,
                0,
                0
            );
        }

        function initializeMeshObject( mesh ) {
            let vertices = mesh.getVertexData( Engine3D.Mesh.VertexType.Position );
            let colors   = mesh.getVertexData( Engine3D.Mesh.VertexType.Color );
            let vertexBuffer = this[ $program ].createBuffer( Engine3D.Buffer.Type.Vertex, vertices );
            let colorBuffer  = this[ $program ].createBuffer( Engine3D.Buffer.Type.Vertex, colors );

            vertexBuffer.size = 3;
            vertexBuffer.count = vertexBuffer.data.length / vertexBuffer.size;
            mesh.setBufferData( Engine3D.Mesh.VertexType.Position, vertexBuffer );

            colorBuffer.size = 4;
            colorBuffer.count = colorBuffer.data.length / colorBuffer.size;
            mesh.setBufferData( Engine3D.Mesh.VertexType.Color, colorBuffer );

            mesh.initialized = true;
        }

        function registerDomResizeEvent() {
            globalContext.addEventListener( "resize", resizeCanvasElement.bind( this ) );
        }

        function resizeCanvasElement() {
            this[ $canvas ].width  = globalContext.innerWidth;
            this[ $canvas ].height = globalContext.innerHeight;
        }

        Engine3D.Renderer = Renderer;

    })( libraryContext );

    ( function( Engine3D ) {

        const $children = Symbol( "Scene::Children" );

        class Scene {
            constructor() {
                this[ $children ] = new Set();
            }

            add( item ) {
                assert( item instanceof Engine3D.Mesh,
                    "Can't add the given item to the scene's children object, becuase it's NOT an instance of `Engine3D.Mesh`."
                );

                if ( !item.id )
                    item.id = Math.random().toString();

                this[ $children ].add( item );
            }

            remove( item ) {
                assert( item instanceof Engine3D.Mesh,
                    "Can't add the given item to the scene's children object, becuase it's NOT an instance of `Engine3D.Mesh`."
                );

                let set = this[ $children ];
                set.forEach( ( child ) => {
                    if ( equal( child.id, item.id ) )
                        set.delete( child );
                });
            }

            get children() {
                return this[ $children ];
            }
        }

        Engine3D.Scene = Scene;

    })( libraryContext );

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


    globalContext[ libraryName ] = libraryContext;

})( window, "Engine3D" );