let camera, scene, renderer;
let geometry, material, mesh;
let container;

init();
animate();

function init() {
    container = document.getElementById('3dModelViewer');

    camera = new THREE.PerspectiveCamera(70, container.offsetWidth / container.offsetHeight, 0.01, 10);
    camera.position.z = 2;

    scene = new THREE.Scene();

    // Load the STL file
    const loader = new THREE.STLLoader();
    loader.load('OpenEarableModel.stl', function (geometry) {
        material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    // Optional: Rotate the model for visualization purposes
    if(mesh) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}