( function( globalContext ) {
    "use strict";

    const canvasId = "webgl-application";

    class App {
        execute() {
            let renderer = new Engine3D.Renderer( canvasId );
            renderer.render();

            let scene = new Engine3D.Scene();

            let mesh = new Engine3D.Mesh();
            mesh.setVertexData( Engine3D.Mesh.VertexType.Position,
                new Float32Array([
                    // First triangle
                     1.0, -1.0,  0.0,
                     1.0,  1.0,  0.0,
                    -1.0,  1.0,  0.0,

                    // Second triangle
                     1.0, -1.0,  0.0,
                    -1.0,  1.0,  0.0,
                    -1.0, -1.0,  0.0
                ])
            );

            let colors = new Float32Array( 24 );

            for ( let i = 0; i < colors.length; i += 4 ) {
                colors[ i ]     = Math.random();
                colors[ i + 1 ] = Math.random();
                colors[ i + 2 ] = Math.random();
                colors[ i + 3 ] = 1.0;
            }

            mesh.setVertexData( Engine3D.Mesh.VertexType.Color, colors );
            mesh.position.z = -7.0;
            scene.add( mesh );

            renderer.setActiveScene( scene );
        }
    }

    document.addEventListener( "DOMContentLoaded", function( event ) {
        let app = new App();
        app.execute();
    });

})( window );