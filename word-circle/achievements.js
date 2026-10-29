/* Standalone progress + event bridge. Codex should map events into the existing Movohray achievements system. */
(function(){'use strict';
const KEY='movohray-word-circle-achievements-v1';
const defaults=()=>({completed:[],noHint:[],bonuses:[],languages:[],longWord:false,unlocked:[]});
let backend=null,memory=defaults();
function normalize(x){const d=defaults();for(const k of ['completed','noHint','bonuses','languages','unlocked'])d[k]=Array.isArray(x?.[k])?[...new Set(x[k].filter(v=>typeof v==='string'))]:[];d.longWord=x?.longWord===true;for(const k of ['completed','noHint'])d[k]=[...new Set(d[k].map(id=>{const parts=id.split(':');return parts.length>=2?parts[0]+':'+[...parts[1].toLowerCase()].sort().join(''):id;}))];return d;}
function get(){if(backend)return normalize(backend.get());try{const raw=localStorage.getItem(KEY);return raw?normalize(JSON.parse(raw)):memory;}catch{return memory;}}
function connect(value){backend=value;}

function record(type,info){if(info.packKey){const parts=info.packKey.split(':');if(parts.length>=2)info={...info,packKey:parts[0]+':'+[...parts[1].toLowerCase()].sort().join('')};}const x=get(),previous=new Set(x.unlocked);const unique=(arr,item)=>{if(!arr.includes(item))arr.push(item);};
  if(type==='bonus')unique(x.bonuses,info.locale+':'+info.word);
  if(type==='long_word')x.longWord=true;
  if(type==='complete'){unique(x.completed,info.packKey);unique(x.languages,info.locale);if(!info.usedHint)unique(x.noHint,info.packKey);}
  if(x.completed.length>=1)unique(x.unlocked,'wfirst');
  if(x.completed.length>=5)unique(x.unlocked,'w5');
  if(x.completed.length>=10)unique(x.unlocked,'w10');
  if(x.bonuses.length>=10)unique(x.unlocked,'bonus10');
  if(x.noHint.length>=3)unique(x.unlocked,'nohint3');
  if(x.languages.length>=3)unique(x.unlocked,'polyglot');
  if(x.longWord)unique(x.unlocked,'longword');
  memory=x;if(backend)backend.save(x);else try{localStorage.setItem(KEY,JSON.stringify(x));}catch{}
  const added=x.unlocked.filter(id=>!previous.has(id));
  for(const id of added){window.dispatchEvent(new CustomEvent('movohray:wordcircle:achievement',{detail:{id,game:'word-circle',locale:info.locale,stats:{completed:x.completed.length,bonuses:x.bonuses.length}}}));}
  return added;
}
window.WordCircleAchievements={get,record,connect,normalize};
})();
