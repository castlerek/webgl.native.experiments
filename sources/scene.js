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