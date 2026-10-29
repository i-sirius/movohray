var Slovokolo=(function(){
'use strict';
let mounted=null,root=null,configured=false,themeObserver=null;
const names={uk:['Словоколо','Літерниця · З’єднуй літери, складай слова й відкривай кросворд','← У меню'],ru:['Словокруг','Литерница · Соединяй буквы, составляй слова и открывай кроссворд','← В меню'],en:['Word Circle','Letter Weave · Connect letters, make words and reveal the crossword','← Menu']};
const ids=['wfirst','w5','w10','bonus10','nohint3','polyglot','longword'];
const titles={uk:['Перший кросворд','Знавець слів','Майстер кросвордів','Мисливець за словами','Без підказок','Поліглот','Довге слово'],ru:['Первый кроссворд','Знаток слов','Мастер кроссвордов','Охотник за словами','Без подсказок','Полиглот','Длинное слово'],en:['First crossword','Word Explorer','Crossword Master','Bonus Hunter','No Hints Needed','Polyglot','Long Word']};
const descriptions={uk:['Заверши один набір.','Заверши 5 різних наборів.','Заверши 10 різних наборів.','Знайди 10 різних бонусних слів.','Заверши 3 різні набори без підказок.','Заверши набір кожною з трьох мов.','Знайди слово із 7 літер.'],ru:['Заверши один набор.','Заверши 5 разных наборов.','Заверши 10 разных наборов.','Найди 10 разных бонусных слов.','Заверши 3 разных набора без подсказок.','Заверши набор на каждом из трёх языков.','Найди слово из 7 букв.'],en:['Complete one pack.','Complete 5 different packs.','Complete 10 different packs.','Find 10 different bonus words.','Complete 3 different packs without hints.','Complete a pack in each of the three languages.','Find a seven-letter word.']};
function copy(lang){return names[lang]||names.uk;}
function configure(){
 if(configured)return;configured=true;
 for(const lang of ['uk','ru','en']){
  WORD_GUESS_TEXT[lang].achievementGameSlovokolo=copy(lang)[0];
  ids.forEach((id,i)=>{WORD_GUESS_TEXT[lang]['wc_'+id+'_title']=titles[lang][i];WORD_GUESS_TEXT[lang]['wc_'+id+'_description']=descriptions[lang][i];});
 }
 WordCircleAchievements.connect({get:()=>wordGuessAchievementsState.wordCircle,save:data=>{wordGuessAchievementsState.wordCircle=data;persistWordGuessAchievementsState();}});
 const saved=WordCircleAchievements.get();
 // Import standalone progress once, without replacing existing shared progress.
 try{const legacy=WordCircleAchievements.normalize(JSON.parse(localStorage.getItem('movohray-word-circle-achievements-v1')));for(const k of ['completed','noHint','bonuses','languages','unlocked'])saved[k]=[...new Set([...saved[k],...legacy[k]])];saved.longWord ||= legacy.longWord;}catch{}
 wordGuessAchievementsState.wordCircle=saved;persistWordGuessAchievementsState();
 saved.unlocked.filter(id=>ids.includes(id)).forEach(id=>unlockWordGuessAchievement('wordcircle-'+id));
}
window.addEventListener('movohray:wordcircle:achievement',e=>{if(ids.includes(e.detail.id))unlockWordGuessAchievement('wordcircle-'+e.detail.id);});
function open(){
 configure();
 const host=document.getElementById('slovokoloScreen');
 if(!root){root=host.attachShadow({mode:'open'});const syncTheme=()=>{host.dataset.wcTheme=document.body.dataset.theme||'light';};themeObserver=new MutationObserver(syncTheme);themeObserver.observe(document.body,{attributes:true,attributeFilter:['data-theme']});syncTheme();}
 if(mounted)mounted.destroy();
 root.innerHTML='<link rel="stylesheet" href="word-circle/style.css?rev='+ASSET_REVISION+'"><div class="integrated"><button type="button" id="back" class="control">'+copy(selectedWordGuessLanguage)[2]+'</button>'+WordCircleView+'</div>';
 const card=root.querySelector('.card');
 const journey=document.createElement('p');journey.id='journey';journey.className='journey';card.insertBefore(journey,root.querySelector('.settings'));
 const layout=document.createElement('div');layout.className='play-layout';
 const board=document.createElement('div');board.className='board-pane';
 const input=document.createElement('div');input.className='input-pane';
 card.insertBefore(layout,root.querySelector('.meta'));
 for(const el of [root.querySelector('.meta'),root.getElementById('gridWrap'),root.getElementById('message')])board.append(el);
 for(const el of [root.getElementById('current'),root.getElementById('wheel'),root.querySelector('.controls')])input.append(el);
 layout.append(board,input);
 const book=document.createElement('details');book.id='wordbook';book.hidden=true;
 book.innerHTML='<summary data-i18n="wordbook"></summary><p class="note" data-i18n="wordbookhelp"></p><div class="bonus-list" id="wordbookWords"></div>';
 card.insertBefore(book,root.querySelector('.note'));
 root.getElementById('back').onclick=()=>requestAppBack({source:'control',destination:'menu'});
 mounted=mountWordCircle(root,{locale:selectedWordGuessLanguage,feedback:kind=>{if(kind==='tap'){playHapticFeedback('tap');return;}playGameSound(kind==='bonus'?'positiveTick':kind);playHapticFeedback(kind==='wrong'?'wrong':'correct');}});
 showScreen('slovokolo');
 requestAnimationFrame(()=>{mounted?.refresh();root.getElementById('back').focus();});
}
function onScreen(name){document.getElementById('slovokoloScreen').classList.toggle('active',name==='slovokolo');if(name!=='slovokolo'&&mounted){mounted.destroy();mounted=null;}}
return {open,onScreen,copy,ids,configure};
}());
