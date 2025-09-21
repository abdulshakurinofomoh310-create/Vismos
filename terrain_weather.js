
// terrain_weather.js - terrain, sculpt, day-night, rain (expanded)
(function(){
  window.ForestSDK = window.ForestSDK || {};
  const sceneRef = window.scene, cam = window.camera, rend = window.renderer;
  if(!sceneRef || !cam || !rend) { console.warn('terrain_weather missing core'); return; }

  // create terrain if missing
  if(!window._vismosTerrain){
    const size = 200, seg = 200;
    const geom = new THREE.PlaneGeometry(size, size, seg, seg); geom.rotateX(-Math.PI/2);
    for(let i=0;i<geom.attributes.position.count;i++) geom.attributes.position.setY(i, (Math.random()-0.5)*0.2);
    geom.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color:0x6aa84f });
    const mesh = new THREE.Mesh(geom, mat); mesh.receiveShadow = true; sceneRef.add(mesh);
    window._vismosTerrain = { mesh, size, seg, geom };
    window.ground = mesh;
  }

  // sculpt state
  const sculpt = { enabled:false, tool:'raise', radius:3, strength:0.6, flattenHeight:0 };
  window.ForestSDK.sculptMode = function(on){ sculpt.enabled = !!on; };
  window.ForestSDK.sculptTool = function(opts){ Object.assign(sculpt, opts||{}); };

  // raycast helpers & sculpting
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  function getIntersect(x,y){
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((x-rect.left)/rect.width)*2 -1; mouse.y = -((y-rect.top)/rect.height)*2 +1;
    ray.setFromCamera(mouse, cam);
    const hits = ray.intersectObject(window._vismosTerrain.mesh, true);
    return hits.length ? hits[0] : null;
  }
  let painting=false, lastTime=performance.now();
  rend.domElement.addEventListener('pointerdown', (e)=>{ if(!sculpt.enabled) return; painting=true; const h = getIntersect(e.clientX,e.clientY); if(h) sculptAt(h.point, 0.016); });
  rend.domElement.addEventListener('pointermove', (e)=>{ if(!sculpt.enabled || !painting) return; const now=performance.now(); const dt=Math.min(0.05,(now-lastTime)/1000); lastTime=now; const h=getIntersect(e.clientX,e.clientY); if(h) sculptAt(h.point, dt); });
  rend.domElement.addEventListener('pointerup', ()=> painting=false);

  function sculptAt(worldPos, dt){
    const T = window._vismosTerrain; if(!T) return;
    const posAttr = T.geom.attributes.position; const r = sculpt.radius; const s = sculpt.strength * (dt||0.016);
    for(let i=0;i<posAttr.count;i++){
      const vx=posAttr.getX(i), vz=posAttr.getZ(i);
      const dx=vx-worldPos.x, dz=vz-worldPos.z; const dist=Math.sqrt(dx*dx+dz*dz);
      if(dist<=r){
        const fall = 1 - (dist/r);
        let vy = posAttr.getY(i);
        if(sculpt.tool==='raise') vy += s*fall;
        else if(sculpt.tool==='lower') vy -= s*fall;
        else if(sculpt.tool==='smooth') vy = THREE.MathUtils.lerp(vy, 0, s*0.2*fall);
        else if(sculpt.tool==='flatten') vy = THREE.MathUtils.lerp(vy, sculpt.flattenHeight, s*fall);
        posAttr.setY(i, vy);
      }
    }
    posAttr.needsUpdate=true; T.geom.computeVertexNormals();
  }

  // weather/day-night: lightweight
  const Weather = { dayFraction:0.5, running:false, speed:0.01, rain:false, sun:null, hemi:null, rainMesh:null };
  Weather.sun = new THREE.DirectionalLight(0xffffff,1.0); Weather.sun.position.set(50,80,25); Weather.sun.castShadow=true; sceneRef.add(Weather.sun);
  Weather.hemi = new THREE.HemisphereLight(0x8899ff, 0x332211, 0.5); sceneRef.add(Weather.hemi);

  function updateLighting(){
    const t = Weather.dayFraction; const ang = (t*Math.PI*2) - Math.PI/2;
    Weather.sun.position.set(Math.cos(ang)*80, Math.sin(ang)*80, 20);
    const sunIntensity = Math.max(0.05, Math.sin(ang));
    Weather.sun.intensity = THREE.MathUtils.lerp(0.15, 1.1, THREE.MathUtils.clamp(sunIntensity,0,1));
    const dayColor = new THREE.Color(0xfff0c8), nightColor=new THREE.Color(0x406090);
    Weather.sun.color.copy(dayColor).lerp(nightColor, 1-Math.max(0,sunIntensity));
    sceneRef.background = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x0b1b2b), 1 - THREE.MathUtils.clamp(sunIntensity,0,1));
  }
  Weather.setTimeOfDay = function(f){ Weather.dayFraction = f%1; updateLighting(); };
  Weather.enableDayNightCycle = function(on, speed){ Weather.running = !!on; if(speed) Weather.speed = speed; };
  Weather.setWeather = function(opts){ if(opts.rain!==undefined) Weather.rain = !!opts.rain; if(Weather.rain) ensureRain(); if(Weather.rainMesh) Weather.rainMesh.visible = Weather.rain; };

  function ensureRain(){
    if(Weather.rainMesh) return;
    const count=400; const geo=new THREE.BufferGeometry(); const pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){ pos[i*3+0]=(Math.random()-0.5)*200; pos[i*3+1]=Math.random()*80+10; pos[i*3+2]=(Math.random()-0.5)*200; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({ size:0.6, color:0xaaccff, transparent:true, opacity:0.7 });
    const points = new THREE.Points(geo, mat); points.name='rain'; sceneRef.add(points); Weather.rainMesh = points;
  }

  // ticks
  window._vmTicks.push((t)=>{
    const now = performance.now()/1000;
    if(Weather.running){ Weather.dayFraction = (Weather.dayFraction + Weather.speed*(1/60)) % 1; updateLighting(); }
    if(Weather.rain && Weather.rainMesh) {
      const attr = Weather.rainMesh.geometry.attributes.position;
      for(let i=0;i<attr.count;i++){ let y = attr.getY(i); y -= 60*(1/60); if(y < -5) y = Math.random()*60+40; attr.setY(i,y); } attr.needsUpdate=true;
    }
  });

  // expose SDK
  window.ForestSDK.setWeather = Weather.setWeather;
  window.ForestSDK.setTimeOfDay = Weather.setTimeOfDay;
  window.ForestSDK.enableDayNightCycle = Weather.enableDayNightCycle;
  window.ForestSDK.sculptMode = function(on){ sculpt.enabled = !!on; };
  window.ForestSDK.sculptTool = window.ForestSDK.sculptTool || function(opts){ Object.assign(sculpt, opts||{}); };

  console.log('[terrain_weather] installed.');
})();
