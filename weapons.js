
// weapons.js - weapons system (fuller)
(function(){
  if(!window.ForestSDK) window.ForestSDK = {};
  const WARN='[Weapons]';
  class Weapon {
    constructor(name, opts){ Object.assign(this, { name }, opts); this.last= -9999; }
    can(now){ return (now - (this.last||0)) >= (this.cooldown||0.5); }
    hit(now, ctx){ this.last = now; if(this.on) this.on(now, ctx); }
  }
  const weapons = {
    sword: new Weapon('Sword',{damage:14,range:2.0,cooldown:0.45,on:function(now,ctx){
      const origin = window.player.mesh.position.clone();
      const forward = new THREE.Vector3(); window.camera.getWorldDirection(forward); forward.y=0; forward.normalize();
      const enemies = Array.isArray(window.enemies)?window.enemies:[]; enemies.forEach(e=>{
        if(!e.alive) return;
        const d = e.mesh.position.distanceTo(origin);
        if(d < 2.0){ e.takeDamage && e.takeDamage(this.damage); }
      });
    }}),
    bow: new Weapon('Bow',{damage:10,range:40,cooldown:0.6,on:function(now,ctx){
      const origin = window.player.mesh.position.clone().add(new THREE.Vector3(0,1.2,0));
      const dir = window.camera.getWorldDirection(new THREE.Vector3()).normalize();
      // spawn simple projectile
      const geo = new THREE.SphereGeometry(0.12,8,8); const mat = new THREE.MeshStandardMaterial({ color:0xffdd88 });
      const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(origin); scene.add(mesh);
      const speed = 28; const life = 3000; const start = performance.now();
      function projTick(t){
        const dt = (t - start) / 1000;
        mesh.position.addScaledVector(dir, speed * (1/60));
        // check collisions
        const enemies = Array.isArray(window.enemies)?window.enemies:[]; for(const en of enemies){
          if(!en.alive) continue;
          if(mesh.position.distanceTo(en.mesh.position) < 1.0){ en.takeDamage && en.takeDamage(10); if(mesh.parent) mesh.parent.remove(mesh); window._vmTicks = window._vmTicks.filter(x=>x!==projTick); break; }
        }
        if(performance.now() - start > life){ if(mesh.parent) mesh.parent.remove(mesh); window._vmTicks = window._vmTicks.filter(x=>x!==projTick); }
      }
      window._vmTicks.push(projTick);
    }})
  };
  let current = weapons.sword;
  window.ForestSDK.equipWeapon = function(name){ current = weapons[name] || current; console.log(WARN,'equipped',current.name); };
  window.ForestSDK.attackCurrentWeapon = function(){ const now = performance.now()/1000; if(current && current.can(now)){ current.hit(now,{}); } };
  window.ForestSDK.getAvailableWeapons = ()=> Object.keys(weapons);
  // input bindings
  window.addEventListener('keydown', (e)=>{ if(e.code==='Digit1') ForestSDK.equipWeapon('sword'); if(e.code==='Digit2') ForestSDK.equipWeapon('bow'); if(e.code==='Space') ForestSDK.attackCurrentWeapon(); });
  console.log('[weapons] loaded.');
})();
