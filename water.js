
// water.js - lakes & rivers (prototype)
(function(){
  if(!window._vismosTerrain){ console.warn('water requires terrain'); return; }
  const scene = window.scene;
  const size = window._vismosTerrain.size;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(size,size,2,2), new THREE.MeshBasicMaterial({ color:0x2b8fbf, transparent:true, opacity:0.6 }));
  water.rotateX(-Math.PI/2); water.position.y = -1.2; scene.add(water);
  window.ForestSDK.createLake = function(opts){ opts = opts||{}; console.log('createLake',opts); };
  window.ForestSDK.createRiver = function(opts){ opts = opts||{}; console.log('createRiver',opts); };
  window.ForestSDK.setWaterLevel = function(y){ water.position.y = y; };
  window.ForestSDK.toggleWaterFlow = function(on){ console.log('toggleWaterFlow',on); };
  console.log('[water] installed.');
})();
