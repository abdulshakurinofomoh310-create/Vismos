
// ui_panels.js - inventory/quest UI panels
(function(){
  // left and right columns elements exist in index.html
  const left = document.getElementById('left'), right = document.getElementById('right');
  // Inventory panel
  const inv = document.createElement('div'); inv.className='panel'; inv.id='inventoryPanel'; inv.innerHTML = '<b>Inventory & Stats</b><div id="invContent"></div>'; left.appendChild(inv);
  function rebuild(){
    const content = document.getElementById('invContent');
    const stats = window.ForestSDK.playerStats || { gold:0, xp:0, items:{} };
    content.innerHTML = '<div>Gold: '+(stats.gold||0)+'</div><div>XP: '+(stats.xp||0)+'</div><div><b>Items</b></div>';
    const items = stats.items || {};
    const keys = Object.keys(items);
    if(keys.length===0) content.innerHTML += '<div>(empty)</div>'; else keys.forEach(k=> content.innerHTML += '<div>'+k+' x'+items[k]+'</div>');
  }
  setInterval(rebuild, 1000);

  // Quests panel
  const qp = document.createElement('div'); qp.className='panel'; qp.id='questPanel'; qp.innerHTML = '<b>Quests</b><div id="questItems"></div>'; right.appendChild(qp);
  function rebuildQuests(){
    const cont = document.getElementById('questItems'); cont.innerHTML='';
    const store = window._questStore || {};
    Object.keys(store).forEach(id=>{
      const q = store[id];
      const el = document.createElement('div'); el.style.padding='6px'; el.style.marginBottom='6px'; el.style.background='rgba(255,255,255,0.02)'; el.innerHTML = '<b>'+ (q.title||id) +'</b><div class="small">'+(q.desc||'')+'</div>';
      if(q.status==='inactive'){ const b=document.createElement('button'); b.className='btn'; b.innerText='Accept'; b.onclick=()=>{ window.ForestSDK.acceptQuest(id); }; el.appendChild(b); }
      cont.appendChild(el);
    });
  }
  setInterval(rebuildQuests, 1200);

  console.log('[ui_panels] loaded.');
})();
