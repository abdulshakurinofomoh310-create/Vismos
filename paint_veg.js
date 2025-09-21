
// paint_veg.js - splat painting + scatter vegetation (prototype)
(function(){
  window.ForestSDK = window.ForestSDK || {};
  if(!window._vismosTerrain){ console.warn('paint_veg requires terrain'); return; }
  const T = window._vismosTerrain; const scene = window.scene, camera = window.camera, renderer = window.renderer;
  const size = T.size; const res = 1024;
  const canvas = document.createElement('canvas'); canvas.width=res; canvas.height=res;
  const ctx = canvas.getContext('2d'); ctx.fillStyle='rgb(160,140,110)'; ctx.fillRect(0,0,res,res);
  const tex = new THREE.CanvasTexture(canvas); tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  // simple shader usage omitted here; instead we keep canvas to export
  window.ForestSDK.getSplatImageDataURL = () => canvas.toDataURL();
  window.ForestSDK.loadSplatImageDataURL = (d)=>{ const img = new Image(); img.onload=()=> ctx.drawImage(img,0,0,res,res); img.src=d; tex.needsUpdate=true; };
  // painting -> world raycasting to paint canvas
  let painting=false, layer='grass', radius=18, strength=0.6;
  renderer.domElement.addEventListener('pointerdown', (e)=>{ if(!painting) return; });
  window.ForestSDK.startPaintMode = function(on){ painting = !!on; };
  window.ForestSDK.setPaintTool = function(opts){ if(opts.radius) radius = opts.radius; if(opts.strength) strength = opts.strength; if(opts.layer) layer = opts.layer; };
  // vegetation scatter (instanced simple)
  window.ForestSDK.scatterVegetation = function(opts){
    opts = opts||{}; const count = opts.count||400; for(let i=0;i<count;i++){ const x=(Math.random()-0.5)*size, z=(Math.random()-0.5)*size; const g=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.6), new THREE.MeshStandardMaterial({color:0x2e8c28, side:THREE.DoubleSide})); g.rotateX(-Math.PI/2); g.position.set(x,0.3,z); scene.add(g);} console.log('scattered veg',count);
  };
  window.ForestSDK.clearVegetation = function(){ /* not implemented in this module */ };
  console.log('[paint_veg] installed.');
})();
