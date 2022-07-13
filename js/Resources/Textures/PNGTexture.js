/*
 * # Copyright (C) Pedro G. Bascoy
 # This file is part of piured-engine <https://github.com/piulin/piured-engine>.
 #
 # piured-engine is free software: you can redistribute it and/or modify
 # it under the terms of the GNU General Public License as published by
 # the Free Software Foundation, either version 3 of the License, or
 # (at your option) any later version.
 #
 # piured-engine is distributed in the hope that it will be useful,
 # but WITHOUT ANY WARRANTY; without even the implied warranty of
 # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 # GNU General Public License for more details.
 #
 # You should have received a copy of the GNU General Public License
 # along with piured-engine.If not, see <http://www.gnu.org/licenses/>.
 *
 */
"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

import * as THREE from '../../../node_modules/three/src/Three.js'

class PNGTexture {


    _map ;

    constructor(renderer,texturePath) {
        this.clonedTextures = [] ;
        let clonedTexturesLocal = this.clonedTextures ;
        let mapLocal =  new THREE.TextureLoader().load( texturePath ,
            function (){
            for ( const map of clonedTexturesLocal ) {
                map.image = mapLocal.image;
                map.needsUpdate = true ;
                renderer.initTexture(map) ;
            }
        }) ;


        this._map = mapLocal ;

        // to accurately represent the colors
        this._map.encoding = THREE.sRGBEncoding;

        this._map.wrapS = THREE.RepeatWrapping;


        renderer.initTexture(this._map) ;



    }

    get map() {
        return this._map ;
    }

    cloneMap() {

        const cloned = this._map.clone();
        this.clonedTextures.push( cloned ) ;
        cloned.needsUpdate = true ;
        return cloned ;

    }
}

export {PNGTexture} ;