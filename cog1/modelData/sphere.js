/**
 * Creates a unit sphere by subdividing a unit octahedron.
 * Starts with a unit octahedron and subdivides the faces,
 * projecting the resulting points onto the surface of a unit sphere.
 *
 * For the algorithm see:
 * https://sites.google.com/site/dlampetest/python/triangulating-a-sphere-recursively
 * http://sol.gfxile.net/sphere/index.html
 * http://nipy.sourceforge.net/dipy/reference/dipy.core.triangle_subdivide.html
 * http://skyview.gsfc.nasa.gov/blog/index.php/2008/12/31/skyview-to-include-healpix-and-wmap/
 *
 *        1
 *       /\
 *      /  \
 *    b/____\ c
 *    /\    /\
 *   /  \  /  \
 *  /____\/____\
 * 0      a     2
 *
 * Parameter:
 * 	recursionDepth
 * 	color or -1 = many colors
 *
 * For texture see:
 * http://earthobservatory.nasa.gov/Features/BlueMarble/
 *
 * @namespace cog1.data
 * @module sphere
 */

define(["exports", "data", "glMatrix"], function(exports, data) {
	"use strict";

	/**
	 * Procedural calculation.
	 *
	 * @parameter object with fields:
	 * @parameter scale
	 * @parameter recursionDepth
	 * @parameter color [-1 for many colors]
	 */
	exports.create = function(parameter) {
				
		if(parameter) {
			var scale = parameter.scale;
			var recursionDepth = parameter.recursionDepth;
			var color = parameter.color;
			var textureURL = parameter.textureURL;
		}
		// Set default values if parameter is undefined.
		if(scale == undefined) {
			scale = 250;
		}
		if(recursionDepth == undefined) {
			recursionDepth = 3;
		}
		if(color == undefined) {
			color = 9;
		}
		if(textureURL == undefined) {
			textureURL = "";
		}

		// Instance of the model to be returned.
		var instance = {};

		// BEGIN exercise Sphere

		// Starting with octahedron vertices
        //      a = (0+2)/2
        //      b = (0+1)/2
        //      c = (1+2)/2
        //
        //        1
        //       /\        Normalize a, b, c
        //      /  \
        //    b/____\ c    Construct new triangles
        //    /\    /\       t1 [0,b,a]
        //   /  \  /  \      t2 [b,1,c]
        //  /____\/____\     t3 [a,b,c]
        // 0      a     2    t4 [a,c,2]

        // vertices
        instance.vertices = [
            [ 1.0, 0.0, 0.0],
            [-1.0, 0.0, 0.0],
            [ 0.0, 1.0, 0.0],
            [ 0.0,-1.0, 0.0],
            [ 0.0, 0.0, 1.0],
            [ 0.0, 0.0,-1.0]
        ];

		// octahedron triangles
        instance.triangles = [
            [ 0, 4, 2 ],
            [ 2, 4, 1 ],
            [ 1, 4, 3 ],
            [ 3, 4, 0 ],
            [ 0, 2, 5 ],
            [ 2, 1, 5 ],
            [ 1, 3, 5 ],
            [ 3, 0, 5 ]
        ];

		// END exercise Sphere
		
		devide_all.call(instance, recursionDepth);

		generateTextureCoordinates.call(instance);

		data.applyScale.call(instance, scale);
		data.setColorForAllPolygons.call(instance, color);

		instance.textureURL = textureURL;

		return instance;
	}
	/**
	 * Called with this pointer set to instance.
	 * Generate texture coordinates one per each corner of a polygon,
	 * thus a vertex can have more than one uv, depending on the polygon it is part of.
	 * The coordinates u.v represent the angles theta and phi
	 * of point vector to x and y axis.
	 * See:
	 * http://tpreclik.dyndns.org/codeblog/?p=9
	 *
	 * Assume that vertices are not yet scaled, thus have length 1.
	 *
	 */
	function generateTextureCoordinates() {

		// BEGIN exercise Sphere-Earth-Texture

		// As there is not exactly one texture coordinate per vertex,
		// we have to install a different mapping as used for polygonVertices to vertices.
		// For texture coordinate system use openGL standard, where origin is bottom-left.
		this.textureCoord = [];
		this.polygonTextureCoord = [];


			// Loop over vertices/edges in polygon.

				// Shorthands for the current vertex.


				// Calculate longitude (east-west position) phi (u-coordinate).
				// arctangent (of here z/x), representing the angle theta between the positive X axis, and the point.
				// Scale phi to uv range [0,1].


				// Calculate latitude (north-south position) theta (v-coordinate) from y component of vertex.
				// Scale theta to uv range [0,1].


				// Store new uv coordinate in new uv-vector.
				//console.log("phi:" + (~~(phi * 100)) + "  theta:" + (~~(theta * 100)) + " x:" + (~~(x * 100)) + " z:" + (~~(z * 100)));
				

		// Problem with phi/u: phi=360 and phi=0 are the same point in 3D and also on a tiled texture.
		// But for faces it is a difference if uv-range is 350�-360� [.9-1]or 350�-0� [.9-0].
		// Thus, insert a check/hack (assuming faces cover only a small part of the texture):

			// Check if u-range should be low or high (left or right in texture),
			// by summing up u values (ignoring u=0 values).

			// Check and correct u values if 0;
		
		// END exercise Sphere-Earth-Texture
	}

	// BEGIN exercise Sphere

	/**
	 * Recursively divide all triangles.
	 */
	function devide_all(recursionDepth, nbRecusions) {
		// nbRecusions is not set from initial call.
		if(nbRecusions == undefined) {
			nbRecusions = 0;
		}
		// Stop criterion.
        if (nbRecusions == recursionDepth) {
            return;
        }
        //console.log("nbRecusions: "+nbRecusions);

        // Assemble divided polygons in an new array.
        var newPolygon = [];
        for(var v = 0; v < this.polygonVertices.length; v++) {
            // Indices of the last three new vertices.
            var v0 = this.vertices[this.polygonVertices[v][0]];
            var v1 = this.vertices[this.polygonVertices[v][1]];
            var v2 = this.vertices[this.polygonVertices[v][2]];

            // Calculate new vertex in the middle of edge.
            var a = vec3.create();
            var b = vec3.create();
            var c = vec3.create();

            vec3.add(v0,v2,a);
            vec3.multiply(a,0.5);
            vec3.add(v0,v1,b);
            vec3.multiply(b,0.5);
            vec3.add(v1,v2,c);
            vec3.multiply(c,0.5);

            a = normalize(a);
            b = normalize(b);
            c = normalize(c);

            var aIndex = addVertices(this.vertices,a);
            var bIndex = addVertices(this.vertices,b);
            var cIndex = addVertices(this.vertices,c);


            console.log("Calculate new vertex "+aIndex);


            //console.log("New vertex exists "+v+"->"+newIndex[v]+" : "+this.vertices[p[v]]+" + "+ this.vertices[p[next]]+" = "+ newVertex);

            // Assemble new polygons.
            p.push([this.polygonVertices[v][0],bIndex,aIndex]);
            p.push([bIndex,this.polygonVertices[v][1],cIndex]);
            p.push([aIndex,bIndex,cIndex]);
            p.push([aIndex,cIndex,this.polygonVertices[v][2]]);

            // Assure mathematical positive order to keep normals pointing outwards.
            // Triangle in the center.

            // Triangle in the corners.

            //console.log("Assemble new polygons "+v+" : "+p[v]+" , "+ newIndex[nextButOne]+" , "+ newIndex[v]);
        }
        // Swap result.
        this.polygonVertices = p;
        // Recursion.
        devide_all.call(this, recursionDepth, nbRecusions+1);



		// Assemble divided polygons in an new array.

			// Indices of the last three new vertices.

				// Calculate new vertex in the middle of edge.

				// Check if the new vertex exists already.
				// This happens because edges always belong to two triangles.

					// Remember index of new vertex.

					//console.log("Calculate new vertex "+v+"->"+newIndex[v]+" : "+vertices[p[v]]+" + "+ vertices[p[next]]+" = "+ newVertex);

					// Use the existing vertex for the new polygon.

					//console.log("New vertex exists "+v+"->"+newIndex[v]+" : "+this.vertices[p[v]]+" + "+ this.vertices[p[next]]+" = "+ newVertex);

			// Assemble new polygons.
			// Assure mathematical positive order to keep normals pointing outwards.
			// Triangle in the center.

			// Triangle in the corners.

				//console.log("Assemble new polygons "+v+" : "+p[v]+" , "+ newIndex[nextButOne]+" , "+ newIndex[v]);

		// Swap result.

		// Recursion.

	// END exercise Sphere
    }

    function calcMiddle (x,y,z) {
        x[0] = (v0[0] + v2[0]) * 0.5;
        x[1] = (v0[1] + v2[1]) * 0.5;
        x[2] = (v0[2] + v2[2]) * 0.5;
    }

    function normalize (arr) {
        // move Point so that distance to P0(0,0,0) equal 1
        var len = Math.sqrt(arr[0]*arr[0]+arr[1]*arr[1]+arr[2]*arr[2]);
        arr[0] = arr[0]/len;
        arr[1] = arr[1]/len;
        arr[2] = arr[2]/len;
        return arr;
    }

    function addVertices(v, point) {
        //console.log(dojo.indexOf(p, triangle));
        var index = dojo.indexOf(v, point);
        // Check if the new vertex exists already.
        // This happens because edges always belong to two triangles.
        if ( index < 0) {
            v.push(point);
            // Remember index of new vertex.
            return v.length-1;
        } else {
            // Use the existing vertex for the new polygon.
            return index;
        }
    }

});
