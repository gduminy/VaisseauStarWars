// This program was developped by Daniel Audet and uses sections of code  
// from http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//
//  It has been adapted to be compatible with the "MV.js" library developped
//  for the book "Interactive Computer Graphics" by Edward Angel and Dave Shreiner.

"use strict";

var gl;   // The webgl context.

var CoordsLoc;       // Location of the coords attribute variable in the standard texture mappping shader program.
var NormalLoc;
var TexCoordLoc;

var ProjectionLoc;     // Location of the uniform variables in the standard texture mappping shader program.
var ModelviewLoc;
var NormalMatrixLoc;
var alphaLoc;


var aCoordsbox;     // Location of the coords attribute variable in the shader program used for texturing the environment box.
var aNormalbox;
var aTexCoordbox;

var uModelviewbox;
var uProjectionbox;
var uEnvbox;

var aCoordsmap;      // Location of the attribute variables in the environment mapping shader program.
var aNormalmap;
var aTexCoordmap;

var uProjectionmap;     // Location of the uniform variables in the environment mapping shader program.
var uModelviewmap;
var uNormalMatrixmap;
var uSkybox;

var colorLoc;


var projection;   //--- projection matrix
var modelview;    // modelview matrix
var flattenedmodelview;    //--- flattened modelview matrix

var normalMatrix = mat3();  //--- create a 3X3 matrix that will affect normals

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.

var sphere, cylinder, box, teapot, disk, torus, cone;  // model identifiers
var hemisphereinside, hemisphereoutside, thindisk;
var quartersphereinside, quartersphereoutside;
var hexagon, triangle, triangle3D, boxAiles;

var prog;  // shader program identifier
var progmap;

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);

var initialmodelview;

var CentreDuVaisseau = 0;

var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 0.1, 0.3, 1.0);
var materialDiffuse = vec4(0.48, 0.55, 0.69, 1.0);
var materialSpecular = vec4(0.48, 0.55, 0.69, 1.0);
var materialShininess = 100.0;

var TextureDeLaSphere;
var TextureDesAiles;
var InterieurDelAile;
var BarreDesAiles;
var StructureDesLiaison;
var ContourDesAiles;
var TextureDeLaTerre;
var TextureDeVenus;
var TextureDeMars;
var TextureDeLune;
var TextureCubeTranslucide;
var UtiliserPhong;

var x = 0;

var ntextures_loaded=0;
var ntextures_tobeloaded=0;

var img = new Array(6);
var img2 = new Array(6);
var ct = 0;
var ct2 =0;

var progbox;
var envbox;
var modela;

var texIDmap0;  // environmental texture identifier
var texIDmap1;
var texID1, texID2, texID3, texID4;  // standard texture identifiers
var rotZ = 0, rotY = 0; 

var BaseColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.231, 0.258, 0.317, 1.0 ),  // grey
];


var ambientProduct, diffuseProduct, specularProduct;
var Ka;

function handleLoadedTextureMap(texture) {

    if (ct == 6) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
           gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        ct++
    }


    if (ct2 == 6) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
           gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img2[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        ct2++;
    }
    ntextures_loaded++;
    render();  // Call render function when the image has been loaded (to insure the model is displayed)
}


function initTexture(){


    var urls = [
       "../Textures/nebula_posx.png", "../Textures/nebula_negx.png",
       "../Textures/nebula_posy.png", "../Textures/nebula_negy.png",
       "../Textures/nebula_posz.png", "../Textures/nebula_negz.png"
    ];

    texIDmap0 = gl.createTexture();

    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function () {  // this function is called when the image download is complete
            ct++;
            handleLoadedTextureMap(texIDmap0);
        }
        img[i].src = urls[i];   // this line starts the image downloading thread
        ntextures_tobeloaded++;

    }


  var urls = [
       "../Textures/posx.jpg", "../Textures/negx.jpg",
       "../Textures/posy.jpg", "../Textures/negy.jpg",
       "../Textures/posz.jpg", "../Textures/negz.jpg"
    ];

    texIDmap1 = gl.createTexture();
    for (var i = 0; i < 6; i++) {
        img2[i] = new Image();
        img2[i].onload = function () {  // this function is called when the image download is complete
            ct2++;
            handleLoadedTextureMap(texIDmap1);
        }
        img2[i].src = urls[i];   // this line starts the image downloading thread
        ntextures_tobeloaded++;
    }




    TextureDeLaSphere = gl.createTexture();
    TextureDeLaSphere.image = new Image();
    console.log(TextureDeLaSphere);
    TextureDeLaSphere.image.onload = function (){
        handleLoadedTexture(TextureDeLaSphere)
    }

    TextureDeLaSphere.image.src = "../Textures/cockpit2.jpg";
    ntextures_tobeloaded++;

    TextureDesAiles = gl.createTexture();
    TextureDesAiles.image = new Image();
    console.log(TextureDesAiles);
    TextureDesAiles.image.onload = function (){
        handleLoadedTexture(TextureDesAiles)
    }

    TextureDesAiles.image.src = "5.jpg";
    ntextures_tobeloaded++;

    InterieurDelAile = gl.createTexture();
    InterieurDelAile.image = new Image();
    console.log(InterieurDelAile);
    InterieurDelAile.image.onload = function (){
        handleLoadedTexture(InterieurDelAile)
    }

    InterieurDelAile.image.src = "../Textures/wing.jpg";
    ntextures_tobeloaded++;

    BarreDesAiles = gl.createTexture();
    BarreDesAiles.image = new Image();
    console.log(BarreDesAiles);
    BarreDesAiles.image.onload = function (){
        handleLoadedTexture(BarreDesAiles)
    }

    BarreDesAiles.image.src = "../Textures/wing-bars.jpg";
    ntextures_tobeloaded++;

    StructureDesLiaison = gl.createTexture();
    StructureDesLiaison.image = new Image();
    console.log(StructureDesLiaison);
    StructureDesLiaison.image.onload = function (){
        handleLoadedTexture(StructureDesLiaison)
    }

    StructureDesLiaison.image.src = "../Textures/wing-structure.jpg";
    ntextures_tobeloaded++;

    ContourDesAiles = gl.createTexture();
    ContourDesAiles.image = new Image();
    console.log(ContourDesAiles);
    ContourDesAiles.image.onload = function (){
        handleLoadedTexture(ContourDesAiles)
    }

    ContourDesAiles.image.src = "../Textures/iron.jpg";
    ntextures_tobeloaded++;

    TextureDeLaTerre = gl.createTexture();
    TextureDeLaTerre.image = new Image();
    console.log(TextureDeLaTerre);
    TextureDeLaTerre.image.onload = function (){
        handleLoadedTexture(TextureDeLaTerre)
    }

    TextureDeLaTerre.image.src = "../Textures/Terre.jpg";
    ntextures_tobeloaded++;

    TextureDeVenus = gl.createTexture();
    TextureDeVenus.image = new Image();
    console.log(TextureDeVenus);
    TextureDeVenus.image.onload = function (){
        handleLoadedTexture(TextureDeVenus)
    }

    TextureDeVenus.image.src = "../Textures/venusmap.jpg";
    ntextures_tobeloaded++;

    TextureDeMars = gl.createTexture();
    TextureDeMars.image = new Image();
    console.log(TextureDeMars);
    TextureDeMars.image.onload = function (){
        handleLoadedTexture(TextureDeMars)
    }

    TextureDeMars.image.src = "../Textures/mars.jpg";
    ntextures_tobeloaded++;

    TextureDeLune = gl.createTexture();
    TextureDeLune.image = new Image();
    console.log(TextureDeLune);
    TextureDeLune.image.onload = function (){
        handleLoadedTexture(TextureDeLune)
    }

    TextureDeLune.image.src = "../Textures/lune.jpg";
    ntextures_tobeloaded++;

    TextureCubeTranslucide = gl.createTexture();
    TextureCubeTranslucide.image = new Image();
    console.log(TextureCubeTranslucide);
    TextureCubeTranslucide.image.onload = function (){
        handleLoadedTexture(TextureCubeTranslucide)
    }

    TextureCubeTranslucide.image.src = "../Textures/CubeTranslucide.png";
    ntextures_tobeloaded++;
}


function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    ntextures_loaded++;

    render();  // Call render function when the image has been loaded (to insure the model is displayed)

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function AjouterUneTexture(texture){
    if(ntextures_loaded == ntextures_tobeloaded)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
            // Send texture to sampler
        gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);
    }
}


function changeColor(a,b,c){
    gl.useProgram(prog);
        
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, vec4(a,b,c,1.0));
    specularProduct = mult(lightSpecular, materialSpecular);
        
    gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(prog, "shininess"), materialShininess);

    gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));

    gl.uniformMatrix4fv(ProjectionLoc, false, flatten(projection)); // send projection matrix to the new shader program

    gl.enableVertexAttribArray(CoordsLoc);
    gl.enableVertexAttribArray(NormalLoc);
    gl.disableVertexAttribArray(TexCoordLoc);   // we do not need texture coordinates
}

function CouleurSansPhong(){
    gl.uniform1f(gl.getUniformLocation(prog, "Phong"), 1.0)
}

function CouleurAvecPhong(){
    gl.uniform1f(gl.getUniformLocation(prog, "Phong"), 0.0)
}


function render() {
        gl.useProgram(prog);

    gl.clearColor(0.0, 0.0, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    projection = perspective(60.0, 1.0, 1.0, 2000.0);


    //--- Get the rotation matrix obtained by the displacement of the mouse
    //---  (note: the matrix obtained is already "flattened" by the function getViewMatrix)
    flattenedmodelview = rotator.getViewMatrix();
    modelview = unflatten(flattenedmodelview);
    modelview = mult(modelview, translate(0,0,-rotZ));
    modelview = mult(modelview, rotate(rotY,0,1,0));
    
    
    

    //normalMatrix = extractNormalMatrix(modelview);
  if (ntextures_loaded == ntextures_tobeloaded) {
     x=x+2;
    var initialmodelview = modelview;

    

    // Draw the environment (box)
   gl.useProgram(progbox); // Select the shader program that is used for the environment box.

    gl.uniformMatrix4fv(uProjectionbox, false, flatten(projection));

    gl.enableVertexAttribArray(aCoordsbox);
    gl.disableVertexAttribArray(aNormalbox);     // normals are not used for the box
    gl.disableVertexAttribArray(aTexCoordbox);  // texture coordinates not used for the box

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texIDmap0);
    // Send texture to sampler
    gl.uniform1i(uEnvbox, 0);
    modelview = mult(modelview, translate(0,0,rotZ));
    envbox.render();

    gl.useProgram(progmap);

    gl.uniformMatrix4fv(uProjectionmap, false, flatten(projection)); // send projection matrix to the new shader program

    gl.enableVertexAttribArray(aCoordsmap);
    gl.enableVertexAttribArray(aNormalmap);
    gl.disableVertexAttribArray(aTexCoordmap);  // texture coordinates not used (environmental mapping)

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texIDmap1);
    // Send texture to sampler
    gl.uniform1i(uSkybox, 0);

        //--- Now extract the matrix that will affect normals (3X3).
        //--- It is achieved by simply taking the upper left portion (3X3) of the modelview matrix
        //--- (since normals are not affected by translations, only by rotations). 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0,-15,0));
    modelview = mult(modelview, rotate(x,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modela.render();  //  modelview and normalMatrix are sent to the shader in the "render()" method


  
        
    gl.useProgram(prog);
    gl.uniform1f(alphaLoc, 1.0)
// Sphére Central
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0,0,0));
    modelview = mult(modelview, rotate(90,0,1,0));
    modelview = mult(modelview, rotate(-90,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.5,.5,.5));
    CouleurAvecPhong();
    AjouterUneTexture(TextureDeLaSphere);
    changeColor(1,0,0)
    sphere.render();
   

// Deux Blaster en Bas de la Sphére Centrale
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-1.4,-3.5,3));
    modelview = mult(modelview, rotate(0,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.04,.04,.13));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[1]));
    cylinder.render();
    


    modelview = initialmodelview;
    modelview = mult(modelview, translate(1.4,-3.5,3));
    modelview = mult(modelview, rotate(0,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.04,.04,.13));
    //changeColor(0,0.3,0);
    cylinder.render();
    
  

//Gauche

    //liaison entre la sphére et l'aile 

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-7,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.15,.15,.7));
    CouleurAvecPhong();
    AjouterUneTexture(ContourDesAiles);
    changeColor(0.6,0.6,0.6)
    cylinder.render();


    modelview = initialmodelview;
    modelview = mult(modelview, translate(-8,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.18,.18,.05));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    cylinder.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-9.5,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.2,.1,.1));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-11,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.18,.18,.05));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    cylinder.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-8,3,0));
    modelview = mult(modelview, rotate(90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.3,.4,.7));
    CouleurAvecPhong();
    AjouterUneTexture(ContourDesAiles);
    triangle3D.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-8,-3,0));
    modelview = mult(modelview, rotate(180,1,0,0));
    modelview = mult(modelview, rotate(90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.3,.4,.7));
    triangle3D.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-4,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.2,.2,.2));
    hexagon.render();

    // Aile Gauche 

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.4,1.4,.03));
    CouleurAvecPhong()
    AjouterUneTexture(InterieurDelAile);
    hexagon.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.475,.4,.05));
    AjouterUneTexture(StructureDesLiaison);
    hexagon.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    AjouterUneTexture(BarreDesAiles);
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    AjouterUneTexture(BarreDesAiles);
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,-6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,-6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,0,-7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.99,0,7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();
// Ceci est la deuxieme partie des raie des ailes (interieur)
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,-6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,-6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,0,-7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-13.988,0,7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();


    //Contour de l'hexagon de l'aile gauche 

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,11.68,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.08,.07,.1));
    AjouterUneTexture(ContourDesAiles);
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,5.768,11.18));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.94,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,5.9,-11.22));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.932,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,-11.68,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.08,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,-5.9,11.22));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.932,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(-14,-5.768,-11.2));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.94,.07,.1));
    box.render();



// Droite

    //liaison entre la sphére et l'aile 

    modelview = initialmodelview;
    modelview = mult(modelview, translate(+7,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.15,.15,.7));
    AjouterUneTexture(ContourDesAiles);
    cylinder.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(+8,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.18,.18,.05));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    cylinder.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(9.5,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.2,.1,.1));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(+11,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.18,.18,.05));
    CouleurSansPhong()
    gl.uniform4fv(colorLoc, flatten(BaseColors[8]));
    cylinder.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(8,3,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.3,.4,.7));
    CouleurAvecPhong();
    AjouterUneTexture(ContourDesAiles);
    triangle3D.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(8,-3,0));
    modelview = mult(modelview, rotate(180,1,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.3,.4,.7));
    triangle3D.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(4,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.2,.2,.2));
    hexagon.render();

    // Aile Droite

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.4,1.4,.03));
    CouleurAvecPhong()
    AjouterUneTexture(InterieurDelAile)
    hexagon.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,0,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.475,.4,.05));
    AjouterUneTexture(StructureDesLiaison);
    hexagon.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    AjouterUneTexture(BarreDesAiles);
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,-6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,-6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,0,-7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.99,0,7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.9,.1,.065));
    box.render();

    // Ceci est la deuxieme partie des raie des ailes (interieur)
    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,-6.2,4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,-6.2,-4));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(55,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,0,-7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(13.999,0,7.8));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.8,.1,.065));
    boxAiles.render();





    //Contour de l'hexagon de l'aile Droite

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,11.68,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.08,.07,.1));
    AjouterUneTexture(ContourDesAiles)
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,5.768,11.18));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.94,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,5.9,-11.22));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.932,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,-11.68,0));
    modelview = mult(modelview, rotate(-90,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.08,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,-5.9,11.22));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.932,.07,.1));
    box.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(14,-5.768,-11.2));
    modelview = mult(modelview, rotate(-90,0,1,0));
    modelview = mult(modelview, rotate(-60,0,0,1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.94,.07,.1));
    box.render();


    // La Terre
   
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0,15,-50));
    modelview = mult(modelview, rotate(x,0,1,0));
    modelview = mult(modelview, rotate(-90,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1,1,1));
    CouleurAvecPhong();
    AjouterUneTexture(TextureDeLaTerre);
    sphere.render();


    // Venus
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-15,-15,-50));
    modelview = mult(modelview, rotate(x,0,1,0));
    modelview = mult(modelview, rotate(-90,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1,1,1));
    CouleurAvecPhong();
    AjouterUneTexture(TextureDeVenus);
    sphere.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(35,-15,-50));
    modelview = mult(modelview, rotate(x,0,1,0));
    modelview = mult(modelview, rotate(-90,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1,1,1));
    CouleurAvecPhong();
    AjouterUneTexture(TextureDeMars);
    sphere.render();

    modelview = initialmodelview;
    modelview = mult(modelview, translate(0,15,-50));
    modelview = mult(modelview, rotate(x,0,1,0));
    modelview = mult(modelview, translate(20,15,-50));;
    modelview = mult(modelview, rotate(-90,1,0,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.6,.6,.6));
    CouleurAvecPhong();
    AjouterUneTexture(TextureDeLune);
    sphere.render(); 

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.depthMask(false);  // Le tampon sera en lecture seulement.
                              // Les objets translucides seront cachÃ©s
                              // s'ils sont derriÃ¨re des objets opaques 
                              //  mais ils seront visibles s'ils sont devant.

    gl.uniform1f(alphaLoc, 0.5);


    modelview = initialmodelview;
    modelview = mult(modelview, translate(0,20,0));
    modelview = mult(modelview, rotate(x,0,1,0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(.6,.6,.6));
    CouleurAvecPhong();
    AjouterUneTexture(TextureCubeTranslucide);
    box.render(); 

    gl.disable(gl.BLEND);
    gl.depthMask(true);  // ne pas oublier car on ne pourra pas effacer 
                             // le tampon de profondeur lors de la prochaine itÃ©ration



    }

}

   




function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

function extractNormalMatrix(matrix) { // This function computes the transpose of the inverse of 
    // the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )

    var result = mat3();
    var upperleft = mat3();
    var tmp = mat3();

    upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
    upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
    upperleft[2][0] = matrix[2][0];

    upperleft[0][1] = matrix[0][1];
    upperleft[1][1] = matrix[1][1];
    upperleft[2][1] = matrix[2][1];

    upperleft[0][2] = matrix[0][2];
    upperleft[1][2] = matrix[1][2];
    upperleft[2][2] = matrix[2][2];

    tmp = matrixinvert(upperleft);
    result = transpose(tmp);

    return result;
}

function matrixinvert(matrix) {

    var result = mat3();

    var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
                 matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                 matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

    var invdet = 1 / det;

    // inverse of matrix m
    result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
    result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
    result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
    result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
    result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
    result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
    result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
    result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
    result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

    return result;
}


function createModel(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(TexCoordLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
    return model;
}

function createModelbox(modelData) {  // For creating the environment box.
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(aCoordsbox, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(uModelviewbox, false, flatten(modelview));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
    return model;
}

function createModelmap(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);

    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(aCoordsmap, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(aNormalmap, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(uModelviewmap, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(uNormalMatrixmap, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        console.log(this.count);
    }
    return model;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    var fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}


function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var fsource = "";
    var node = element.firstChild;
    var str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}

/**
 *  An event listener for the keydown event.  It is installed by the init() function.
 */
function doKey(evt) {
    var rotationChanged = true;
    switch (evt.keyCode) {
        case 37: rotY -= 2; break;        // left arrow
        case 39: rotY += 2; break;       // right arrow
        case 38: rotZ -= 2; break;        // up arrow
        case 40: rotZ += 2; break;        // down arrow
        case 13: rotZ = rotY = 0; break;  // return
        case 36: rotZ = rotY = 0; break;  // home
        default: rotationChanged = false;
    }
    if (rotationChanged) {
        evt.preventDefault();
//        render();  // render() is not call when the arrows are pressed
    }
}



window.onload = function init() {
    try {
        var canvas = document.getElementById("glcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            throw "Could not create WebGL context.";
        }

        // LOAD SHADER (standard texture mapping)
        var vertexShaderSource = getTextContent("vshader");
        var fragmentShaderSource = getTextContent("fshader");
       

        prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(prog);


        // locate variables for further use
        CoordsLoc = gl.getAttribLocation(prog, "vcoords");
        NormalLoc = gl.getAttribLocation(prog, "vnormal");
        TexCoordLoc = gl.getAttribLocation(prog, "vtexcoord");
        alphaLoc = gl.getUniformLocation(prog, "alpha");

        ModelviewLoc = gl.getUniformLocation(prog, "modelview");
        ProjectionLoc = gl.getUniformLocation(prog, "projection");
        NormalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");

        colorLoc = gl.getUniformLocation( prog, "color" );

        // LOAD SHADER (boxtexture mapping)
        var vertexShaderSourcebox = getTextContent("vshaderbox");
        var fragmentShaderSourcebox = getTextContent("fshaderbox");


        progbox = createProgram(gl, vertexShaderSourcebox, fragmentShaderSourcebox);

        gl.useProgram(progbox);

        aCoordsbox = gl.getAttribLocation(progbox, "vcoords");
        aNormalbox = gl.getAttribLocation(progbox, "vnormal");
        aTexCoordbox = gl.getAttribLocation(progbox, "vtexcoord");

        uModelviewbox = gl.getUniformLocation(progbox, "modelview");
        uProjectionbox = gl.getUniformLocation(progbox, "projection");

        uEnvbox = gl.getUniformLocation(progbox, "skybox");

         // LOAD FIRST SHADER  (environmental mapping)
        var vertexShaderSourcemap = getTextContent("vshadermap");
        var fragmentShaderSourcemap = getTextContent("fshadermap");
        progmap = createProgram(gl, vertexShaderSourcemap, fragmentShaderSourcemap);

        gl.useProgram(progmap);

        // locate variables for further use
        aCoordsmap = gl.getAttribLocation(progmap, "vcoords");
        aNormalmap = gl.getAttribLocation(progmap, "vnormal");
        aTexCoordmap = gl.getAttribLocation(progmap, "vtexcoord");

        uModelviewmap = gl.getUniformLocation(progmap, "modelview");
        uProjectionmap = gl.getUniformLocation(progmap, "projection");
        uNormalMatrixmap = gl.getUniformLocation(progmap, "normalMatrix");

        uSkybox = gl.getUniformLocation(progmap, "skybox");

        gl.enableVertexAttribArray(aCoordsmap);
        gl.enableVertexAttribArray(aNormalmap);
        gl.disableVertexAttribArray(aTexCoordmap);   // texture coordinates not used (environmental mapping)


        gl.enable(gl.DEPTH_TEST);

        //  create a "rotator" monitoring mouse mouvement
        rotator = new SimpleRotator(canvas, render);
        //  set initial camera position at z=40, with an "up" vector aligned with y axis
        //   (this defines the initial value of the modelview matrix )
        rotator.setView([0, 0, 1], [0, 1, 0], 40);

        initTexture();
 
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        
        // You can use basic models using the following lines

        sphere = createModel(uvSphere(10.0, 25.0, 25.0));
        cylinder = createModel(uvCylinder(10.0, 20.0, 25.0, false, false));
        box = createModel(cube(15.0));
        boxAiles = createModel(CubeAile(15.0));

        hexagon = createModel(uvCylinder(10.0, 20.0, 6.0, false, false));

        teapot = createModel(teapotModel);
        disk = createModel(ring(5.0, 10.0, 25.0));
        torus = createModel(uvTorus(15.0, 5.0, 25.0, 25.0));
        cone = createModel(uvCone(10.0, 20.0, 25.0, true));

        hemisphereinside = createModel(uvHemisphereInside(10.0, 25.0, 25.0));
        hemisphereoutside = createModel(uvHemisphereOutside(10.0, 25.0, 25.0));
        thindisk = createModel(ring(9.5, 10.0, 25.0));

        quartersphereinside = createModel(uvQuartersphereInside(10.0, 25.0, 25.0));
        quartersphereoutside = createModel(uvQuartersphereOutside(10.0, 25.0, 25.0));

        tétraédre = createModel(tétraédre(15.0))
        triangle3D = createModel(Triangle3D(15))

        envbox = createModelbox(cube(1000.0));
        modela = createModelmap(cube(10.0));

        




    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }

    document.addEventListener("keydown", doKey, false);  // add a callback function (when a key is pressed)

    setInterval(render, 100);
}



