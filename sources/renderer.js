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