// Run: node tests/verify_levels.js
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');const env={window:{},console,Math,Map,Set};
vm.runInNewContext(fs.readFileSync(path.join(root,'word-circle/levels.js'),'utf8'),env);
const languages=env.window.WordCircleData;
const src=fs.readFileSync(path.join(root,'word-circle/game.js'),'utf8');
const engine=src.slice(src.indexOf('function key('),src.indexOf('function difficultyOf('));
const engineEnv={console,Math,Map,Set,MAX:23,shuffle(arr){for(let i=arr.length-1;i>0;--i){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}};
vm.runInNewContext(engine+'\nthis.make=generateCrossword;',engineEnv);
const playable=(word,letters)=>{const a=[...letters];for(const ch of word){const idx=a.indexOf(ch);if(idx===-1)return false;a.splice(idx,1);}return true;};
let bad=0,total=0,missed=0,all=0;
for(const [locale,packs] of Object.entries(languages)){
 let entries=0,accepted=0;
 for(let i=0;i<packs.length;i++){
  const p=packs[i];if(p.letters.length<4||p.letters.length>7) {console.error('invalid circle length',locale,p.letters);bad++;}
  for(const kind of ['main','bonus']){
   for(const w of p[kind]){entries++;if(w.length<3||!playable(w,p.letters)){console.error('unplayable',locale,i+1,w,p.letters);bad++;}}
  }
  if(new Set(p.main).size!==p.main.length) {console.error('main duplicates',locale,i+1);bad++;}
  for(let trial=0;trial<3;trial++){
   const grid=engineEnv.make(p.main);total++;accepted+=grid.words.length;missed+=p.main.length-grid.words.length;all+=p.main.length;
   const positions=grid.words.map(p=>Array.from(p.word,(ch,j)=>({k:`${p.r+(p.d==='V'?j:0)},${p.c+(p.d==='H'?j:0)}`,ch})));
   const reached=new Set([0]);let changed=true;while(changed){changed=false;for(let a=0;a<positions.length;a++)if(reached.has(a))for(let b=0;b<positions.length;b++)if(!reached.has(b)&&positions[a].some(x=>positions[b].some(y=>x.k===y.k&&x.ch===y.ch))){reached.add(b);changed=true;}}
   if(reached.size!==grid.words.length){console.error('disconnected',locale,i+1);bad++;}
   for(const cells of positions)for(const cell of cells)if(grid.cells.get(cell.k)!==cell.ch){console.error('conflicting cell',locale,i+1);bad++;}
   if(grid.words.length===0) {console.error('empty grid',locale,i+1);bad++;}
   if(grid.cells.size===0||grid.rows<=0||grid.cols<=0) {console.error('bad layout',locale,i+1);bad++;}
  }
 }
 console.log(locale,packs.length,'packs',entries,'entries');
}
console.log('generated:',total,'boards; placed',all-missed,'of',all,'possible word placements; skipped',missed);
if(missed)bad+=missed;
if(bad){console.error(bad,'errors');process.exitCode=1;}
