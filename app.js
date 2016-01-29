( function( globalContext ) {
    "use strict";

    class Matrix4 {
        constructor() {
            this.rawData = new Float32Array( 16 );
        }

        static convertAngleToRadians( angle ) {
            return angle * Math.PI / 180;
        }

        toIdentity() {
            for ( let i = 0; i < this.rawData.length; i++ ) {
                switch ( i ) {
                    case 0:
                    case 5:
                    case 10:
                    case 15:
                        this.rawData[ i ] = 1;
                        break;
                    default:
                        this.rawData[ i ] = 0;
                        break;
                }
            }

            return this.rawData;
        }

        toPerspective( fovY, aspect, near, far ) {
            let yScale = 1.0 / Math.tan( fovY / 2 );
            let xScale = yScale / aspect;

            for ( let i = 0; i < this.rawData.length; i++ ) {
                switch ( i ) {
                    case 0:
                        this.rawData[ i ] = xScale;
                        break;
                    case 5:
                        this.rawData[ i ] = yScale;
                        break;
                    case 10:
                        this.rawData[ i ] = -( near + far ) / ( far - near );
                        break;
                    case 11:
                        this.rawData[ i ] = -1;
                        break;
                    case 14:
                        this.rawData[ i ] = -2 * near * far / ( far - near );
                        break;
                    default:
                        this.rawData[ i ] = 0;
                        break;
                }
            }

            return this.rawData;
        }

        translate( vector ) {
            this.rawData[ 12 ] = vector.x * this.rawData[ 0 ] + vector.y * this.rawData[ 4 ] + vector.z * this.rawData[ 8  ] + this.rawData[ 12 ];
            this.rawData[ 13 ] = vector.x * this.rawData[ 1 ] + vector.y * this.rawData[ 5 ] + vector.z * this.rawData[ 9  ] + this.rawData[ 13 ];
            this.rawData[ 14 ] = vector.x * this.rawData[ 2 ] + vector.y * this.rawData[ 6 ] + vector.z * this.rawData[ 10 ] + this.rawData[ 14 ];
            this.rawData[ 15 ] = 1;

            return this.rawData;
        }

        rotate( axis, angle ) {
            let self    = this;
            let radians = Matrix4.convertAngleToRadians( angle );
            let sinA    = Math.sin( radians );
            let cosA    = Math.cos( radians );

            let rotateX = () => {
                self.rawData[ 5 ] =  cosA; self.rawData[ 6  ] = sinA;
                self.rawData[ 9 ] = -sinA; self.rawData[ 10 ] = cosA;
            };

            let rotateY = () => {
                self.rawData[ 0 ] = cosA; self.rawData[ 2  ] = -sinA;
                self.rawData[ 8 ] = sinA; self.rawData[ 10 ] =  cosA;
            };

            let rotateZ = () => {
                self.rawData[ 0 ] =  cosA; self.rawData[ 1 ] = sinA;
                self.rawData[ 4 ] = -sinA; self.rawData[ 5 ] = cosA;
            };

            switch ( axis ) {
                case "x":
                    rotateX();
                    break;
                case "y":
                    rotateY();
                    break;
                case "z":
                    rotateZ();
                    break;
                default:
                    throw new Error( "Invalid axis value." );
            }

            return this.rawData;
        }
    }

    function isPowerOf2( value ) {
        return ( value & ( value - 1 ) ) === 0;
    }

    let gl       = null,
        canvas   = null,
        program  = null,
        shaders  = null,
        buffers  = null,
        texture  = null,
        timeLast = null,
        delta    = null;

    let modelMatrix      = new Matrix4(),
        viewMatrix       = new Matrix4(),
        projectionMatrix = new Matrix4();

    let vertices = new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,
        -1,  1, 0
    ]);

    let colors = new Float32Array([
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1
    ]);

    let textureCoordinates = new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        1, 1,
        0, 1,
        0, 0
    ]);

    let vertexIndices = new Uint16Array([
        0, 1, 2,
        2, 3, 0
    ]);

    function initGlContext() {
        canvas = document.getElementById( "webgl-application" );
        canvas.width  = globalContext.innerWidth;
        canvas.height = globalContext.innerHeight;

        gl = canvas.getContext( "webgl" );
    }

    function initShaders() {
        shaders = {
            vertex   : gl.createShader( gl.VERTEX_SHADER ),
            fragment : gl.createShader( gl.FRAGMENT_SHADER )
        };

        gl.shaderSource( shaders.vertex, "\
            attribute vec3 vertexPosition;\
            attribute vec4 vertexColor;\
            attribute vec2 vertexTexture;\
            \
            varying vec4 interpolatedColor;\
            varying vec2 textureCoordinate;\
            \
            uniform mat4 projectionMatrix;\
            uniform mat4 viewMatrix;\
            uniform mat4 modelMatrix;\
            \
            void main( void ) {\
                interpolatedColor = vertexColor;\
                textureCoordinate = vertexTexture;\
                gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4( vertexPosition, 1.0 );\
            }\
        "
        );

        gl.shaderSource( shaders.fragment, "\
            precision highp float;\
            \
            uniform sampler2D sampler;\
            uniform bool hasTexture;\
            \
            varying vec4 interpolatedColor;\
            varying vec2 textureCoordinate;\
            \
            void main( void ) {\
                if ( !hasTexture )\
                    gl_FragColor = interpolatedColor;\
                else\
                    gl_FragColor = texture2D( sampler, textureCoordinate );\
            }\
        "
        );

        gl.compileShader( shaders.vertex );
        gl.compileShader( shaders.fragment );

        if ( !gl.getShaderParameter( shaders.vertex, gl.COMPILE_STATUS ) )
            throw new Error( gl.getShaderInfoLog( shaders.vertex ) );

        if ( !gl.getShaderParameter( shaders.fragment, gl.COMPILE_STATUS ) )
            throw new Error( gl.getShaderInfoLog( shaders.fragment ) );

        return shaders;
    }

    function enableAttributes() {
        gl.enableVertexAttribArray(
            gl.getAttribLocation( program, "vertexPosition" )
        );

        gl.enableVertexAttribArray(
            gl.getAttribLocation( program, "vertexColor" )
        );
    }

    function initGlBuffers() {
        buffers = {
            vertex  : gl.createBuffer( gl.ARRAY_BUFFER ),
            color   : gl.createBuffer( gl.ARRAY_BUFFER ),
            texture : gl.createBuffer( gl.ARRAY_BUFFER ),
            indices : gl.createBuffer( gl.ELEMENT_ARRAY_BUFFER )
        };

        gl.bindBuffer( gl.ARRAY_BUFFER, buffers.vertex );
        gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW );
        buffers.vertex.mi = { size: 3, count: 4 };

        gl.bindBuffer( gl.ARRAY_BUFFER, buffers.color );
        gl.bufferData( gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW );
        buffers.color.mi = { size: 4, count: 4 };

        gl.bindBuffer( gl.ARRAY_BUFFER, buffers.texture );
        gl.bufferData( gl.ARRAY_BUFFER, textureCoordinates, gl.DYNAMIC_DRAW );
        buffers.texture.mi = { size: 2, count: 8 };

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffers.indices );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, vertexIndices, gl.DYNAMIC_DRAW );
        buffers.indices.mi = { size: 1, count: 6 };
    }

    function initTexture() {
        texture = gl.createTexture();
        texture.image = new Image();
        texture.image.src = "assets/textures/box2.png";
        texture.image.onload = ( event ) => {
            handleLoadedTexture();
            texture.initialized = true;
        };
    }

    function handleLoadedTexture( image ) {
        gl.bindTexture( gl.TEXTURE_2D, texture );

        if ( isPowerOf2( texture.image.width ) && isPowerOf2( texture.image.height ) ) {
            gl.generateMipmap( gl.TEXTURE_2D );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        }
        else {
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        }

        gl.bindTexture( gl.TEXTURE_2D, null );
    }

    function initGlProgram() {
        initShaders();

        program = gl.createProgram();
        gl.attachShader( program, shaders.vertex );
        gl.attachShader( program, shaders.fragment );
        gl.linkProgram( program );

        if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
            throw new Error( gl.getProgramInfoLog( program ) );

        enableAttributes();
        gl.useProgram( program );
    }

    function handleRenderingProcess() {
        gl.clearColor( 1, 1, 1, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
        gl.viewport( 0, 0, canvas.width, canvas.height );

        projectionMatrix.toPerspective( 45, canvas.width / canvas.height, 0.1, 10000 );
        viewMatrix.toIdentity();

        gl.uniformMatrix4fv(
            gl.getUniformLocation( program, "projectionMatrix" ),
            false,
            projectionMatrix.rawData
        );

        gl.uniformMatrix4fv(
            gl.getUniformLocation( program, "viewMatrix" ),
            false,
            viewMatrix.rawData
        );

        // vertex
        gl.bindBuffer( gl.ARRAY_BUFFER, buffers.vertex );
        gl.vertexAttribPointer(
            gl.getAttribLocation( program, "vertexPosition" ),
            buffers.vertex.mi.size,
            gl.FLOAT,
            false,
            0,
            0
        );

        // vertex indices
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffers.indices );

        // color
        gl.bindBuffer( gl.ARRAY_BUFFER, buffers.color );
        gl.vertexAttribPointer(
            gl.getAttribLocation( program, "vertexColor" ),
            buffers.color.mi.size,
            gl.FLOAT,
            false,
            0,
            0
        );

        modelMatrix.toIdentity();
        modelMatrix.translate({ x: 0, y: 0, z: -7 });
        modelMatrix.rotate( "y", delta );

        gl.uniformMatrix4fv(
            gl.getUniformLocation( program, "modelMatrix" ),
            false,
            modelMatrix.rawData
        );

        if ( texture instanceof WebGLTexture && texture.initialized ) {
            // texture
            gl.enableVertexAttribArray(
                gl.getAttribLocation( program, "vertexTexture" )
            );

            gl.bindBuffer( gl.ARRAY_BUFFER, buffers.texture );
            gl.vertexAttribPointer(
                gl.getAttribLocation( program, "vertexTexture" ),
                buffers.texture.mi.size,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, texture );
            gl.uniform1i( gl.getUniformLocation( program, "sampler" ), 0 );
            gl.uniform1i( gl.getUniformLocation( program, "hasTexture" ), 1 );
        }
        else
            gl.uniform1i( gl.getUniformLocation( program, "hasTexture" ), 0 );

        gl.drawElements( gl.TRIANGLES, buffers.indices.mi.count, gl.UNSIGNED_SHORT, 0 );
    }

    function handleAnimation() {
        let timeNow = new Date().getTime();

        if ( timeLast !== 0 ) {
            let elapsed = timeNow - timeLast;
            delta += ( 90.0 * elapsed ) / 1000.0;
        }

        timeLast = timeNow;
    }

    function render() {
        handleAnimation();
        handleRenderingProcess();
        globalContext.requestAnimationFrame( render );
    }

    function registerResizeEvent() {
        globalContext.addEventListener( "resize", ( event ) => {
            canvas.width  = globalContext.innerWidth;
            canvas.height = globalContext.innerHeight;
        });
    }

    globalContext.addEventListener( "DOMContentLoaded", ( event ) => {
        initGlContext();
        initGlProgram();
        initGlBuffers();
        initTexture();
        registerResizeEvent();
        render();
    });

})( window );