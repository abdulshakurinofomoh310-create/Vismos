
// creator_ui.js - game creator UI (multi-tab) simplified
(function(){
  window._sceneObjects = window._sceneObjects || { terrain:[], enemies:[], npcs:[], pickups:[], quests:[] };
  const ui = document.createElement('div'); ui.id='creatorUI'; ui.style.position='absolute'; ui.style.right='10px'; ui.style.top='10px'; ui.style.width='320px'; ui.style.zIndex=9999;
  ui.innerHTML = '<div class="panel"><b>Vismos Creator</b><div style="margin-top:8px"><button class="btn" id="tabTerrain">Terrain</button><button class="btn" id="tabEnemies">Enemies</button><button class="btn" id="tabNPCs">NPCs</button><button class="btn" id="tabPickups">Pickups</button><button class="btn" id="tabQuests">Quests</button></div><div id="creatorContent" style="margin-top:8px;max-height:360px;overflow:auto"></div></div>';
  document.body.appendChild(ui);
  const content = document.getElementById('creatorContent'); let current='terrain';
  function render(){
    content.innerHTML='';
    if(current==='terrain'){
      content.appendChild(makeBtn('Add Tree', ()=> spawnTree()));
      content.appendChild(makeBtn('Sculpt Mode', ()=> { ForestSDK.sculptMode && ForestSDK.sculptMode(true); alert('Sculpt mode on'); }));
    } else if(current==='enemies'){
      content.appendChild(makeBtn('Spawn Goblin', ()=> spawnEnemy('goblin')));
    } else if(current==='npcs'){
      content.appendChild(makeBtn('Add NPC', ()=> spawnNPC()));
    } else if(current==='pickups'){
      content.appendChild(makeBtn('Add Herb Pickup', ()=> spawnPickup()));
    } else if(current==='quests'){
      content.appendChild(makeBtn('Add Demo Quest', ()=> addDemoQuest()));
      Object.values(window._questStore||{}).forEach(q=>{ const d=document.createElement('div'); d.innerText = q.title || q.id; content.appendChild(d); });
    }
  }
  function makeBtn(text, cb){ const b=document.createElement('button'); b.className='btn'; b.style.display='block'; b.style.marginBottom='6px'; b.innerText=text; b.onclick=cb; return b; }
  document.getElementById('tabTerrain').onclick=()=>{ current='terrain'; render(); };
  document.getElementById('tabEnemies').onclick=()=>{ current='enemies'; render(); };
  document.getElementById('tabNPCs').onclick=()=>{ current='npcs'; render(); };
  document.getElementById('tabPickups').onclick=()=>{ current='pickups'; render(); };
  document.getElementById('tabQuests').onclick=()=>{ current='quests'; render(); };
  render();

  function spawnTree(){ const x=(Math.random()-0.5)*40, z=(Math.random()-0.5)*40; const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,1), new THREE.MeshStandardMaterial({color:0x704214})); const crown=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.4), new THREE.MeshStandardMaterial({color:0x1f7a1f})); trunk.position.set(x,0.5,z); crown.position.set(x,1.2,z); scene.add(trunk); scene.add(crown); window._sceneObjects.terrain.push({type:'tree', x, z}); }
  function spawnEnemy(type){ const x=(Math.random()-0.5)*40, z=(Math.random()-0.5)*40; const m=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,1), new THREE.MeshStandardMaterial({color:0x883322})); m.position.set(x,0.8,z); scene.add(m); window.enemies = window.enemies||[]; window.enemies.push({ mesh:m, alive:true, type:type||'goblin', takeDamage:function(d){ console.log('enemy took',d); this.alive=false; if(this.mesh.parent) this.mesh.parent.remove(this.mesh); } }); window._sceneObjects.enemies.push({ type, x, z }); }
  function spawnNPC(){ const id='npc_'+Date.now(); const x=(Math.random()-0.5)*40, z=(Math.random()-0.5)*40; const m=new THREE.Mesh(new THREE.BoxGeometry(1,2,1), new THREE.MeshStandardMaterial({color:0x88ccaa})); m.position.set(x,1,z); scene.add(m); window._sceneObjects.npcs.push({ id, x, z}); }
  function spawnPickup(){ const id='pickup_'+Date.now(), x=(Math.random()-0.5)*40, z=(Math.random()-0.5)*40; const m=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8), new THREE.MeshStandardMaterial({color:0x8b5cf6})); m.position.set(x,0.6,z); scene.add(m); window._sceneObjects.pickups.push({ id, x, z, type:'herb' }); }
  function addDemoQuest(){ const q={ id:'q_custom_'+Date.now(), title:'Custom Quest', desc:'Demo', objectives:[{type:'kill', target:1}], status:'inactive', rewards:{ gold:10 } }; window.ForestSDK.addQuest(q); window._sceneObjects.quests.push(q); alert('Quest added'); }

  // Save/load scene JSON buttons
  const saveBtn = document.createElement('button'); saveBtn.className='btn'; saveBtn.innerText='Save Scene'; saveBtn.onclick = ()=> localStorage.setItem('VismosScene', JSON.stringify(window._sceneObjects)); content.appendChild(saveBtn);
  const loadBtn = document.createElement('button'); loadBtn.className='btn'; loadBtn.innerText='Load Scene'; loadBtn.onclick = ()=> { const raw = localStorage.getItem('VismosScene'); if(raw){ window._sceneObjects = JSON.parse(raw); alert('Scene loaded'); } else alert('No scene saved'); }; content.appendChild(loadBtn);

  console.log('[creator_ui] loaded.');
})();
