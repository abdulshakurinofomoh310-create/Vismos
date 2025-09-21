
// quests.js - quest system with types
(function(){
  window._questStore = window._questStore || {};
  window._activeQuests = window._activeQuests || [];
  window.ForestSDK = window.ForestSDK || {};

  function addQuest(q){
    if(!q.id) q.id = 'q_'+Date.now();
    q.status = q.status || 'inactive';
    q.objectives = q.objectives || [];
    window._questStore[q.id] = q;
    console.log('[quests] added', q.id);
  }
  window.ForestSDK.addQuest = addQuest;

  window.ForestSDK.acceptQuest = function(id){
    const q = window._questStore[id]; if(!q) return;
    q.status = 'active'; q.objectives.forEach(o=> o.progress = o.progress||0); if(!window._activeQuests.includes(id)) window._activeQuests.push(id);
  };
  window.ForestSDK.completeQuest = function(id){
    const q = window._questStore[id]; if(!q) return;
    q.status = 'complete';
    const idx = window._activeQuests.indexOf(id); if(idx>=0) window._activeQuests.splice(idx,1);
    // apply rewards
    if(q.rewards){
      if(q.rewards.gold) window.ForestSDK.addGold && window.ForestSDK.addGold(q.rewards.gold);
      if(q.rewards.items) q.rewards.items.forEach(it=> window.ForestSDK.addItemToInventory({ id: it, name: it, qty:1 }));
    }
    console.log('[quests] completed', id);
  };

  // simple polling to watch enemies and pickups for progress
  function inspect(){
    const enemies = Array.isArray(window.enemies) ? window.enemies : [];
    for(const e of enemies){
      if(e._seenAlive && !e.alive){
        // enemy died
        window._activeQuests.slice().forEach(qid=>{
          const q = window._questStore[qid];
          if(!q) return;
          q.objectives.forEach(o=>{
            if(o.type==='kill' && (!o.enemyType || o.enemyType===e.type || o.enemyType==='default')){ o.progress = (o.progress||0)+1; }
          });
          // check complete
          if(q.objectives.every(o=> (o.progress||0) >= (o.target||o.count||1))){ window.ForestSDK.completeQuest(qid); }
        });
      }
      e._seenAlive = !!e.alive;
    }
  }
  window._vmTicks.push(inspect);

  // example quests
  addQuest({ id:'q_demo_kill', title:'Demo: Kill 2', desc:'Defeat two enemies', objectives:[{type:'kill', target:2}], status:'inactive', rewards:{ gold:20, items:['potion_small'] } });

  console.log('[quests] system loaded.');
})();
