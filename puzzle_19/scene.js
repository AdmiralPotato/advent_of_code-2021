// we got these from script tags
// import * as THREE from '../build/three.module.js';
//
// import { GUI } from './jsm/libs/lil-gui.module.min.js';
//
// import { OrbitControls } from './jsm/controls/OrbitControls.js';
// import * as BufferGeometryUtils from './jsm/utils/BufferGeometryUtils.js';

let container, gui;
let camera, controls, scene, renderer, material;

const geometry = new THREE.IcosahedronBufferGeometry(1, 1)


const vertScaleScalar = 15
const vertPosition = new THREE.Vector3();
const rotation = new THREE.Euler();
const vertQuaternion = new THREE.Quaternion();
vertQuaternion.setFromEuler(rotation)
const vertScale = new THREE.Vector3(
  vertScaleScalar,
  vertScaleScalar,
  vertScaleScalar,
);

const allSceneMeshParent = new THREE.Object3D()

// gui

const Method = {
  INSTANCED: 'INSTANCED',
};

const settings = {
  autoRotate: true
};

//

function clean() {

  const meshes = [];

  scene.traverse( function ( object ) {

    if ( object.isMesh ) meshes.push( object );

  } );

  for ( let i = 0; i < meshes.length; i ++ ) {

    const mesh = meshes[ i ];
    mesh.material.dispose();
    mesh.geometry.dispose();

    scene.remove( mesh );

  }

}

const setMatrixToPosition = function (matrix, vert) {
  vertPosition.set(...vert)

  matrix.compose(
    vertPosition,
    vertQuaternion,
    vertScale
  );
};

function initMesh() {

  clean();
  // make instances

  material = new THREE.MeshNormalMaterial();
  geometry.computeVertexNormals();

}

function makeMeshesForVerts( verts, setCount, setIndex ) {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(
      setIndex * (1 / setCount),
      1,
      0.5
    ),
  })
  const matrix = new THREE.Matrix4();
  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    verts.length
  );

  verts.forEach((vert, index) => {
    setMatrixToPosition( matrix, vert );
    mesh.setMatrixAt( index, matrix );
  })

  allSceneMeshParent.add( mesh );

}

function init() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  // camera

  camera = new THREE.PerspectiveCamera( 70, width / height, 0.001, 1000000 );
  camera.position.z = 30;

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( width, height );
  renderer.outputEncoding = THREE.sRGBEncoding;

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  // scene

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );

  // controls

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.autoRotate = settings.autoRotate;

  // gui

  gui = new lil.GUI();

  gui.add(settings, 'autoRotate').onChange(() => {
    controls.autoRotate = settings.autoRotate
  })


  // listeners

  window.addEventListener( 'resize', onWindowResize );

  Object.assign( window, { scene } );

  scene.add(allSceneMeshParent)

}

//

function onWindowResize() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

}

function animate() {

  requestAnimationFrame( animate );

  controls.update();

  render();

}

function render() {

  renderer.render( scene, camera );

}

//

init();
initMesh();
animate();