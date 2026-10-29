'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert');
const store=new Map(),events=[];
const window={dispatchEvent(e){events.push(e.detail)}};
const localStorage={getItem(key){return store.get(key)||null},setItem(key,value){store.set(key,value)}};
class CustomEvent{constructor(name,opts){this.type=name;this.detail=opts.detail;}}
const ctx={window,localStorage,CustomEvent,console};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../word-circle/achievements.js'),'utf8'),ctx);
const api=window.WordCircleAchievements;
for(let i=0;i<10;i++)api.record('complete',{locale:i%3===0?'uk':i%3===1?'ru':'en',packKey:'unique-'+i,usedHint:i>=3});
for(let i=0;i<10;i++)api.record('bonus',{locale:'uk',word:'WORD-'+i});
api.record('long_word',{locale:'en'});
const want=['wfirst','w5','w10','bonus10','nohint3','polyglot','longword'];
assert.deepEqual([...api.get().unlocked].sort(),[...want].sort());
assert.equal(events.length,7);
api.record('complete',{locale:'uk',packKey:'unique-0',usedHint:false});
api.record('bonus',{locale:'uk',word:'WORD-0'});
assert.equal(api.get().completed.length,10);
assert.equal(api.get().bonuses.length,10);
assert.equal(events.length,7);
console.log('PASS: 7 achievements, 7 one-time events; repeated puzzle/word not counted twice');

// Reload must retain the earned IDs and suppress duplicate events.
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../word-circle/achievements.js'),'utf8'),ctx);
window.WordCircleAchievements.record('complete',{locale:'uk',packKey:'unique-0',usedHint:false});
assert.equal(events.length,7);
assert.equal(window.WordCircleAchievements.get().completed.length,10);
// Damaged arrays are normalized instead of crashing record().
store.set('movohray-word-circle-achievements-v1',JSON.stringify({unlocked:[],completed:'broken',noHint:null}));
window.WordCircleAchievements.record('complete',{locale:'uk',packKey:'safe',usedHint:false});
assert.equal(window.WordCircleAchievements.get().completed.length,1);
const blocked={window:{dispatchEvent(){}},CustomEvent,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../word-circle/achievements.js'),'utf8'),blocked);
blocked.window.WordCircleAchievements.record('complete',{locale:'uk',packKey:'offline',usedHint:false});
blocked.window.WordCircleAchievements.record('complete',{locale:'uk',packKey:'offline',usedHint:false});
assert.equal(blocked.window.WordCircleAchievements.get().completed.length,1);
console.log('PASS: reload, corrupt storage and unavailable storage fallback');
