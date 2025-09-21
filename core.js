
// core.js - core scene, player, utilities
window.ForestSDK = window.ForestSDK || {};
(function(){
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7fb7ff);
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
  camera.position.set(0, 12, 28);
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  window.scene = scene; window.camera = camera; window.renderer = renderer;

  // handle resize
  window.addEventListener('resize', ()=> {
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,2,0); controls.update();
  window.controls = controls;

  // basic lighting
  const hemi = new THREE.HemisphereLight(0x8899ff, 0x332211, 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(30,40,20); sun.castShadow=true; scene.add(sun);

  // player placeholder
  const playerMesh = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), new THREE.MeshStandardMaterial({ color:0x3366ff }));
  playerMesh.position.set(0,1,0); playerMesh.castShadow = true; scene.add(playerMesh);
  window.player = { mesh: playerMesh, position: playerMesh.position, stats: { health:100, attackPower:10 } };

  // simple ground helper until terrain module replaces it
  const grid = new THREE.GridHelper(200, 40, 0x444444, 0x222222); scene.add(grid);

  // animation loop management: modules can register tick callbacks
  window._vmTicks = [];
  function animate(){
    requestAnimationFrame(animate);
    const now = performance.now();
    for(const t of window._vmTicks) try{ t(now); } catch(e){ console.warn("tick error",e); }
    renderer.render(scene, camera);
  }
  window.startVismos = function(){ animate(); };
  // start immediately
  animate();

  console.log('[core] Vismos core initialized.');
})();
