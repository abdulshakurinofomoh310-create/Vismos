
// loot_inventory.js - inventory, loot drops, shop
(function(){
  window.ForestSDK = window.ForestSDK || {};
  window.ForestSDK.inventory = window.ForestSDK.inventory || { items: [] };
  window.ForestSDK.playerStats = window.ForestSDK.playerStats || { gold:0, xp:0, items:{} };

  function addItem(item){
    item = item || { id:'item', name:'Item', qty:1 };
    const inv = window.ForestSDK.inventory;
    const ex = inv.items.find(i=>i.id===item.id);
    if(ex) ex.qty += item.qty||1; else inv.items.push({ id:item.id, name:item.name||item.id, qty:item.qty||1 });
    console.log('[loot] added', item);
  }
  window.ForestSDK.addItemToInventory = addItem;
  window.ForestSDK.getInventory = ()=> window.ForestSDK.inventory;
  window.ForestSDK.addGold = function(n){ window.ForestSDK.playerStats.gold = (window.ForestSDK.playerStats.gold||0) + (n||0); console.log('gold+',n); };

  // spawn loot at position (simple visual)
  window.ForestSDK.spawnLootAt = function(list, pos){
    list = list || [{ item:{id:'coin',type:'currency',name:'Coin',qty:1}, kind:'coin' }];
    pos = pos || new THREE.Vector3(0,1,0);
    list.forEach((s,i)=>{
      const geom = s.kind==='coin' ? new THREE.TorusGeometry(0.25,0.08,8,16) : new THREE.SphereGeometry(0.2,8,8);
      const mat = new THREE.MeshStandardMaterial({ color: s.kind==='coin' ? 0xFFD700 : 0x88cc88 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(pos.x + (Math.random()-0.5)*0.6, pos.y + 0.6, pos.z + (Math.random()-0.5)*0.6);
      scene.add(mesh);
      // auto pickup after delay for demo
      setTimeout(()=>{ addItem(s.item); if(mesh.parent) mesh.parent.remove(mesh); }, 900);
    });
  };

  console.log('[loot_inventory] loaded.');
})();
