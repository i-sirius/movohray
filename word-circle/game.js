
window.mountWordCircle=function(root=document,options={}){
const controller=new AbortController();
const listen=(target,type,fn)=>target.addEventListener(type,fn,{signal:controller.signal});
'use strict';
// Редакторський добір загальновживаних слів; кожен головний набір має одну множину літер.
// Перевірені кола та словоформи: джерела й ліцензії у LEXICON_LICENSE.md.
let locale='uk';
let LEVELS=window.WordCircleData.uk;
const I18N={"uk":{"game":"Словоколо","subtitle":"З’єднуй літери, знаходь слова та заповнюй кросворд.","language":"Мова","difficulty":"Складність","any":"Будь-яка","easy":"4–5 літер","medium":"6 літер","hard":"7 літер","submit":"✓ Скласти слово","clear":"↺ Скинути","shuffle":"⇄ Літери","hint":"💡 Підказка","layout":"▦ Інша сітка","new":"✦ Новий кросворд","ach":"Досягнення","help":"Затисни й проведи через літери: слово перевіриться після відпускання. Або натискай їх по черзі. Повторне натискання прибирає літеру; Backspace — прибрати останню, Enter — перевірити.","pack":"Набір {n} із {total} · {letters} літер","stats":"{total} наборів · {words} слів у кросворді","newmsg":"Новий кросворд! Знайди всі слова.","gridmsg":"Сітку перебудовано.","hidden":"Закрита клітинка","letter":"Літера {ch}","empty":"Тут з’явиться складене слово","remove":"Прибрати літеру","removepos":"Прибрати {ch}, позиція {n}","progress":"{n} із {total} слів","bonus":"Бонусні слова: {n}","bonushelp":"Слова поза кросвордом приносять бонуси","removed":"Літеру прибрано","submithelp":"Натисни «Скласти слово», коли закінчиш","continue":"Натискай літери далі","ambig":"«{word}» — правильне слово! Можна продовжити або підтвердити.","cancel":"Проведення перервано","interrupted":"Введення перервано","found":"Чудово! {word} — у кросворді ✓","duplicate":"«{word}» вже знайдено","bonusfound":"★ {word} — бонусне слово!","bonusduplicate":"«{word}» вже в бонусах","unknown":"«{word}» немає в словнику цього набору","win":"🎉 Усі слова знайдено! Обери новий кросворд.","cleared":"Набір очищено","shuffled":"Літери перемішано","nohint":"Більше немає закритих клітинок","hintused":"Відкрито одну літеру 💡","back":"Останню літеру прибрано","achunlocked":"🏆 Досягнення відкрито: {name}!","wfirst":"Перший кросворд","w5":"Знавець слів","w10":"Майстер кросвордів","bonus10":"Мисливець за словами","nohint3":"Без підказок","polyglot":"Поліглот","longword":"Довге слово","count":"Здобуто {n} із {total}","alias":"Літерниця"},"ru":{"game":"Словокруг","subtitle":"Соединяй буквы, находи слова и заполняй кроссворд.","language":"Язык","difficulty":"Сложность","any":"Любая","easy":"4–5 букв","medium":"6 букв","hard":"7 букв","submit":"✓ Проверить слово","clear":"↺ Сбросить","shuffle":"⇄ Буквы","hint":"💡 Подсказка","layout":"▦ Другая сетка","new":"✦ Новый кроссворд","ach":"Достижения","help":"Зажми и проведи через буквы: слово проверится после отпускания. Или нажимай по одной. Повторное нажатие убирает букву; Backspace — удалить последнюю, Enter — проверить.","pack":"Набор {n} из {total} · {letters} букв","stats":"{total} наборов · {words} слов в кроссворде","newmsg":"Новый кроссворд! Найди все слова.","gridmsg":"Сетка перестроена.","hidden":"Закрытая клетка","letter":"Буква {ch}","empty":"Здесь появится составленное слово","remove":"Убрать букву","removepos":"Убрать {ch}, позиция {n}","progress":"{n} из {total} слов","bonus":"Бонусные слова: {n}","bonushelp":"Слова вне кроссворда приносят бонусы","removed":"Буква удалена","submithelp":"Нажми «Проверить слово», когда закончишь","continue":"Нажимай буквы дальше","ambig":"«{word}» — слово найдено! Можно продолжить или подтвердить.","cancel":"Жест прерван","interrupted":"Ввод прерван","found":"Отлично! {word} — в кроссворде ✓","duplicate":"«{word}» уже найдено","bonusfound":"★ {word} — бонусное слово!","bonusduplicate":"«{word}» уже в бонусах","unknown":"«{word}» нет в словаре этого набора","win":"🎉 Все слова найдены! Выбери новый кроссворд.","cleared":"Набор очищен","shuffled":"Буквы перемешаны","nohint":"Больше нет закрытых клеток","hintused":"Открыта одна буква 💡","back":"Последняя буква удалена","achunlocked":"🏆 Достижение открыто: {name}!","wfirst":"Первый кроссворд","w5":"Знаток слов","w10":"Мастер кроссвордов","bonus10":"Охотник за словами","nohint3":"Без подсказок","polyglot":"Полиглот","longword":"Длинное слово","count":"Получено {n} из {total}","alias":"Литерница"},"en":{"game":"Word Circle","subtitle":"Connect letters, discover words and complete the crossword.","language":"Language","difficulty":"Difficulty","any":"Any","easy":"4–5 letters","medium":"6 letters","hard":"7 letters","submit":"✓ Submit word","clear":"↺ Clear","shuffle":"⇄ Shuffle","hint":"💡 Hint","layout":"▦ New layout","new":"✦ New crossword","ach":"Achievements","help":"Hold and swipe through letters, then release to submit. Or tap letters one at a time. Tap a selected letter again to remove it; Backspace removes the last letter, Enter submits.","pack":"Pack {n} of {total} · {letters} letters","stats":"{total} packs · {words} crossword words","newmsg":"New crossword! Find all words.","gridmsg":"Crossword layout changed.","hidden":"Hidden square","letter":"Letter {ch}","empty":"Your selected letters appear here","remove":"Remove this letter","removepos":"Remove {ch}, position {n}","progress":"{n} of {total} words","bonus":"Bonus words: {n}","bonushelp":"Extra valid words earn bonuses","removed":"Letter removed","submithelp":"Tap Submit word when ready","continue":"Keep choosing letters","ambig":"“{word}” is valid! Continue or submit it.","cancel":"Swipe interrupted","interrupted":"Input interrupted","found":"Great! {word} is on the board ✓","duplicate":"“{word}” already found","bonusfound":"★ {word} is a bonus word!","bonusduplicate":"“{word}” already collected","unknown":"“{word}” is not in this pack’s dictionary","win":"🎉 All words found! Start a new crossword.","cleared":"Selection cleared","shuffled":"Letters shuffled","nohint":"No hidden squares remain","hintused":"One letter revealed 💡","back":"Last letter removed","achunlocked":"🏆 Achievement unlocked: {name}!","wfirst":"First crossword","w5":"Word Explorer","w10":"Crossword Master","bonus10":"Bonus Hunter","nohint3":"No Hints Needed","polyglot":"Polyglot","longword":"Long Word","count":"Earned {n} of {total}","alias":"Letter Weave"}};
const EXTRA_COPY={"uk": {"journey": "Пройдено {n} із {total} наборів", "bonus": "Бонусні слова: {n} / {total}", "wordbook": "Словник цього кола", "wordbookhelp": "Тут є основні слова та додаткові словоформи. Перегляд не зараховує бонуси.", "next": "Наступний рівень →", "stats": "{total} наборів · {words} основних слів", "help": "Проведи через літери й відпусти або натискай їх по черзі. Повторне натискання прибирає літеру. Enter — перевірити, Backspace — видалити. Відмінки, множина й інші словоформи приносять бонуси."}, "ru": {"journey": "Пройдено {n} из {total} наборов", "bonus": "Бонусные слова: {n} / {total}", "wordbook": "Словарь этого круга", "wordbookhelp": "Основные слова и дополнительные словоформы. Просмотр не начисляет бонусы.", "next": "Следующий уровень →", "stats": "{total} наборов · {words} основных слов", "help": "Проведи через буквы и отпусти или нажимай по очереди. Повторное нажатие удаляет букву. Enter — проверить, Backspace — удалить. Падежи, множественное число и другие словоформы приносят бонусы."}, "en": {"journey": "Completed {n} of {total} packs", "bonus": "Bonus words: {n} / {total}", "wordbook": "This circle’s dictionary", "wordbookhelp": "Main words and extra word forms. Viewing this list does not award bonuses.", "next": "Next level →", "stats": "{total} packs · {words} main words", "help": "Swipe through letters and release, or tap one at a time. Tap again to remove a letter. Enter submits; Backspace removes. Plurals, inflections and other word forms earn bonuses."}};
for(const lang of Object.keys(EXTRA_COPY))Object.assign(I18N[lang],EXTRA_COPY[lang]);
function tr(k,vars={}){return (I18N[locale][k]||I18N.uk[k]||k).replace(/\{(\w+)\}/g,(_,x)=>String(vars[x]??''));}
Object.assign(I18N.uk,{"bonushelp": "Знайди слово поза сіткою: +1 бал за кожне нове слово. Натисни знайдене слово, щоб дізнатися значення.", "wordbookhelp": "Тут лише знайдені слова. Решта бонусних слів прихована: їх можна шукати й після заповнення сітки. Натисни слово для тлумачення.", "win": "🎉 Сітку заповнено! Шукай бонусні слова або переходь до наступного кола.", "wallet": "★ {n} балів · підказка: 3 бали", "wallethelp": "Старт: 5 балів. +1 за унікальне бонусне слово цією мовою, навіть у різних колах. Повтори не дають балів. Бали зберігаються між раундами й витрачаються на відкриття літер.", "hint": "💡 Літера · 3 бали", "poor": "Потрібно 3 бали. Знаходь нові бонусні слова: кожне дає 1 бал.", "meaning": "Тлумачення", "loading": "Шукаю тлумачення…", "missing": "Вбудованого тлумачення немає. Відкрий словникову статтю; для словоформи може знадобитися початкова форма.", "source": "Стаття у Вікісловнику ↗", "online": "Тлумачення з Вікісловника · CC BY-SA. Для завантаження потрібен інтернет.", "hiddenbonus": "Ще приховано бонусних слів: {n}."});
Object.assign(I18N.ru,{"bonushelp": "Слово вне сетки: +1 балл за каждое новое слово. Нажми найденное слово, чтобы узнать значение.", "wordbookhelp": "Только найденные слова. Остальные бонусы скрыты: ищи их и после заполнения сетки. Нажми слово для толкования.", "win": "🎉 Сетка заполнена! Ищи бонусные слова или переходи к следующему кругу.", "wallet": "★ {n} баллов · подсказка: 3 балла", "wallethelp": "Старт: 5 баллов. +1 за уникальное бонусное слово на этом языке, даже в разных кругах. Повторы не дают баллов. Баллы сохраняются и тратятся на открытие букв.", "hint": "💡 Буква · 3 балла", "poor": "Нужно 3 балла. Находи новые бонусные слова: каждое даёт 1 балл.", "meaning": "Толкование", "loading": "Ищу толкование…", "missing": "Встроенного толкования нет. Открой словарную статью; для словоформы может понадобиться начальная форма.", "source": "Статья в Викисловаре ↗", "online": "Толкование из Викисловаря · CC BY-SA. Для загрузки нужен интернет.", "hiddenbonus": "Ещё скрыто бонусных слов: {n}."});
Object.assign(I18N.en,{"bonushelp": "An extra word earns +1 point when first discovered. Tap a found word for its meaning.", "wordbookhelp": "Only discovered words appear here. Unfound bonus words stay hidden, even after completing the grid. Tap a word for its meaning.", "win": "🎉 Grid complete! Keep hunting bonus words or start the next circle.", "wallet": "★ {n} points · letter hint: 3 points", "wallethelp": "Start with 5 points. Each unique bonus word in a language earns +1, across all circles. Repeats earn nothing. Points persist and pay for letter hints.", "hint": "💡 Letter · 3 points", "poor": "You need 3 points. Discover new bonus words to earn 1 point each.", "meaning": "Meaning", "loading": "Looking up meaning…", "missing": "No built-in definition. Open the dictionary entry; inflected words may require the base form.", "source": "Wiktionary entry ↗", "online": "Definitions from Wiktionary · CC BY-SA. Internet required to load.", "hiddenbonus": "Bonus words still hidden: {n}."});
function updateTexts(){
  if(root===document)document.documentElement.lang=locale;
  if(root===document)document.title='Мовограй · '+tr('game');
  for(const e of root.querySelectorAll('[data-i18n]'))e.textContent=tr(e.dataset.i18n);
  for(const e of root.querySelectorAll('[data-i18n-option]'))e.textContent=tr(e.dataset.i18nOption);
  $('crossword').setAttribute('aria-label',tr('game'));$('wheel').setAttribute('aria-label',tr('help'));$('current').setAttribute('aria-label',tr('empty'));
  $('achTitle').textContent=tr('ach');$('alias').textContent=tr('alias');
  updateAchievementList();
}
const walletKey='slovokolo-wallet-v1';
function readWallet(){try{const x=JSON.parse(localStorage.getItem(walletKey));if(Number.isSafeInteger(x?.balance)&&x.balance>=0&&Array.isArray(x.earned))return x;}catch{}return {balance:5,earned:window.WordCircleAchievements.get().bonuses.slice()};}
let wallet=readWallet();
function persistWallet(){try{localStorage.setItem(walletKey,JSON.stringify(wallet));}catch{}}
function awardBonus(word){const id=locale+':'+word;if(wallet.earned.includes(id))return;wallet.earned.push(id);wallet.balance++;persistWallet();}
function saveSession(){
  if(!state)return;
  try{localStorage.setItem('slovokolo-v5-current-'+locale,JSON.stringify({v:6,packId:state.pack.id,packIndex:state.packIndex,board:state.board.words,tiles:state.tiles,solved:[...state.solved],bonusFound:[...state.bonusFound],hinted:[...state.hinted],difficulty:$('difficulty').value,usedHint:state.usedHint,startedAt:state.startedAt}));}catch{}
}
function restoreSession(){
  try{
    const v=JSON.parse(localStorage.getItem('slovokolo-v5-current-'+locale)||'null');
    if(!v||![5,6].includes(v.v)||!Array.isArray(v.board)||!Array.isArray(v.tiles))return false;
    v.packIndex=v.packId?LEVELS.findIndex(p=>p.id===v.packId):LEVELS.findIndex(p=>[...p.letters].sort().join('')===v.tiles.slice().sort().join(''));
    if(!LEVELS[v.packIndex])return false;
    const pack=LEVELS[v.packIndex];
    if(!['all','easy','medium','hard'].includes(v.difficulty||'all'))return false;
    $('difficulty').value=v.difficulty||'all';
    if(v.board.length!==pack.main.length||new Set(v.board.map(p=>p.word)).size!==pack.main.length)return false;if(v.tiles.slice().sort().join('')!==[...pack.letters].sort().join(''))return false;
    const cells=new Map();let maxR=0,maxC=0;
    for(const p of v.board){if(!pack.main.includes(p.word)||!['H','V'].includes(p.d)||!Number.isInteger(p.r)||!Number.isInteger(p.c)||p.r<0||p.c<0)return false;
      for(let i=0;i<p.word.length;i++){const r=p.r+(p.d==='V'?i:0),c=p.c+(p.d==='H'?i:0);if(r>22||c>22)return false;const k=key(r,c),old=cells.get(k);if(old&&old!==p.word[i])return false;cells.set(k,p.word[i]);maxR=Math.max(maxR,r);maxC=Math.max(maxC,c);}
    }
    if(!cells.size)return false;
    const board={words:v.board,cells,rows:maxR+1,cols:maxC+1};
    const main=new Set(board.words.map(x=>x.word));
    const bonus=getBonus(pack,main);
    state={pack,packIndex:v.packIndex,board,main,bonus,solved:new Set((v.solved||[]).filter(w=>main.has(w))),hinted:new Set((v.hinted||[]).filter(k=>cells.has(k))),bonusFound:new Set((v.bonusFound||[]).filter(w=>bonus.has(w))),tiles:v.tiles,usedHint:!!v.usedHint,startedAt:v.startedAt||Date.now()};
    selected=[];updatePack();renderWheel();setStatus(tr('newmsg'));return true;
  }catch{return false;}
}
function getBonus(pack,main){return new Set(pack.bonus.filter(w=>!main.has(w)&&playable(w,pack.letters)&&w.length>=3));}
function updatePack(){ $('pack').textContent=tr('pack',{n:state.packIndex+1,total:LEVELS.length,letters:state.pack.letters.length});$('stats').textContent=tr('stats',{total:LEVELS.length,words:state.board.words.length}); }
function recordAchievement(type,detail={}){
  const newly=window.WordCircleAchievements.record(type,{locale,packKey:state.pack.id||locale+':'+[...state.pack.letters.toLowerCase()].sort().join(''),...detail});
  if(newly.length)setStatus(tr('achunlocked',{name:tr(newly[0])}),'good');
  updateAchievementList();
}
function updateAchievementList(){
  const data=window.WordCircleAchievements.get();const box=$('achievementList');box.replaceChildren();
  const ids=['wfirst','w5','w10','bonus10','nohint3','polyglot','longword'];
  for(const id of ids){const span=document.createElement('span');span.className='award'+(data.unlocked.includes(id)?' achieved':'');span.textContent=(data.unlocked.includes(id)?'🏆 ':'🔒 ')+tr(id);box.append(span);}
  $('achCount').textContent=tr('count',{n:data.unlocked.length,total:ids.length});
}

const MAX=23;
const $=id=>root.getElementById(id);
const crossword=$('crossword'),wheel=$('wheel'),lines=$('lines'),current=$('current');
const ns='http://www.w3.org/2000/svg';
let vocabulary=new Set(LEVELS.flatMap(p=>[...p.main,...p.bonus]));
let state=null,selected=[],positions=[],activeGesture=null;
let shownPuzzleCount=0;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const walletBox=document.createElement('div');walletBox.className='wallet-box';walletBox.innerHTML='<strong id="walletBalance"></strong><p id="walletHelp" class="note"></p>';$('bonusList').parentNode.prepend(walletBox);
const walletTop=document.createElement('strong');walletTop.className='wallet-pill';root.querySelector('.settings').append(walletTop);
const meaning=document.createElement('section');meaning.className='meaning-panel';meaning.hidden=true;meaning.setAttribute('aria-live','polite');$('bonusList').parentNode.append(meaning);
let meaningRequest=0;
async function showMeaning(word){
 const request=++meaningRequest,language=locale;meaning.hidden=false;meaning.replaceChildren();
 const title=document.createElement('h3');title.textContent=word+' · '+tr('meaning');
 const text=document.createElement('p');text.textContent=tr('loading');
 const link=document.createElement('a');link.href='https://'+language+'.wiktionary.org/wiki/'+encodeURIComponent(word.toLocaleLowerCase(language));link.target='_blank';link.rel='noopener noreferrer';link.textContent=tr('source');
 const credit=document.createElement('small');credit.textContent=window.WordCircleDefinitions.isLocal(language,word)?({uk:'Коротке пояснення Мовограю · доступне без інтернету.',ru:'Краткое пояснение Мовограя · доступно без интернета.',en:'Movohray brief definition · available offline.'}[language]):tr('online');meaning.append(title,text,link,credit);if(language==='uk'){const extra=document.createElement('a');extra.href='https://slovnyk.ua/index.php?swrd='+encodeURIComponent(word.toLowerCase());extra.target='_blank';extra.rel='noopener noreferrer';extra.textContent='Тлумачення на СЛОВНИК.ua ↗';extra.style.display='block';meaning.append(extra);}
 const result=await window.WordCircleDefinitions.lookup(language,word,controller.signal);
 if(request!==meaningRequest||controller.signal.aborted)return;
 text.textContent=result||tr('missing');
}
function wordButton(word){const b=document.createElement('button');b.type='button';b.className='bonus-chip collected';b.textContent=word;b.title=tr('meaning');b.addEventListener('click',()=>showMeaning(word),{signal:controller.signal});return b;}
function playable(word,letters){const pool=[...letters];for(const ch of word){const i=pool.indexOf(ch);if(i<0)return false;pool.splice(i,1);}return true;}
// Аварійна перевірка словників, щоб у кросворд не потрапляло неможливе слово.
const bad=LEVELS.flatMap((pack,i)=>[...pack.main,...pack.bonus].filter(w=>!playable(w,pack.letters)).map(w=>`${i}:${w}`));
if(bad.length)console.warn('Помилка наборів:',bad.join(', '));
function key(r,c){return `${r},${c}`;}
function read(grid,r,c){return grid.get(key(r,c));}
function cellsOf(p){return [...p.word].map((_,i)=>key(p.r+(p.d==='V'?i:0),p.c+(p.d==='H'?i:0)));}
function bounds(placements){let minR=Infinity,minC=Infinity,maxR=-Infinity,maxC=-Infinity;for(const p of placements){for(let i=0;i<p.word.length;i++){const r=p.r+(p.d==='V'?i:0),c=p.c+(p.d==='H'?i:0);minR=Math.min(r,minR);minC=Math.min(c,minC);maxR=Math.max(r,maxR);maxC=Math.max(c,maxC);}}return {minR,minC,maxR,maxC,area:(maxR-minR+1)*(maxC-minC+1)};}
function legal(grid,word,r,c,d,first=false){
  const dr=d==='V'?1:0,dc=d==='H'?1:0,len=[...word].length;
  if(r<1||c<1||r+dr*(len-1)>=MAX-1||c+dc*(len-1)>=MAX-1)return -1;
  if(read(grid,r-dr,c-dc)||read(grid,r+dr*len,c+dc*len))return -1;
  let crossings=0;
  for(let i=0;i<len;i++){
    const rr=r+i*dr,cc=c+i*dc,cur=read(grid,rr,cc);
    if(cur){if(cur.ch!==word[i]||cur.dirs.has(d))return -1;crossings++;}
    else if(d==='H'){
      if(read(grid,rr-1,cc)||read(grid,rr+1,cc))return -1;
    }else if(read(grid,rr,cc-1)||read(grid,rr,cc+1))return -1;
  }
  return first||crossings>0?crossings:-1;
}
function apply(grid,p){const g=new Map([...grid].map(([k,v])=>[k,{ch:v.ch,dirs:new Set(v.dirs)}]));for(let i=0;i<p.word.length;i++){const k=key(p.r+(p.d==='V'?i:0),p.c+(p.d==='H'?i:0));const cur=g.get(k);if(cur)cur.dirs.add(p.d);else g.set(k,{ch:p.word[i],dirs:new Set([p.d])});}return g;}
function choices(grid,placements,word){
  const found=[];const used=new Set();
  for(const [k,cell] of grid){const [rr,cc]=k.split(',').map(Number);
    for(let i=0;i<word.length;i++)if(word[i]===cell.ch){
      for(const d of ['H','V']){
        if(cell.dirs.has(d))continue;
        const r=rr-(d==='V'?i:0),c=cc-(d==='H'?i:0),id=`${r},${c},${d}`;
        if(used.has(id))continue;used.add(id);
        const hits=legal(grid,word,r,c,d);if(hits<0)continue;
        const p={word,r,c,d};const b=bounds([...placements,p]);
        // Випадковість дає різні схеми, компактність запобігає довгим порожнім смугам.
        const score=hits*18-b.area*.28+Math.random()*23;
        found.push({p,score});
      }
    }
  }
  return found.sort((a,b)=>b.score-a.score);
}
function generateCrossword(words){
  const unique=[...new Set(words)].sort((a,b)=>b.length-a.length);
  let best=null;
  for(let trial=0;trial<100;trial++){
    const firstWord=unique[0];
    const first={word:firstWord,r:Math.floor(MAX/2),c:Math.floor(MAX/2)-Math.floor(firstWord.length/2),d:'H'};
    if(Math.random()<.5){first.r=Math.floor(MAX/2)-Math.floor(firstWord.length/2);first.c=Math.floor(MAX/2);first.d='V';}
    let grid=apply(new Map(),first),placed=[first];
    const order=unique.slice(1);
    if(trial%3===1)shuffle(order);
    if(trial%3===2)order.sort((a,b)=>a.length-b.length||Math.random()-.5);
    for(const word of order){
      const opts=choices(grid,placed,word);
      if(!opts.length)continue;
      const take=Math.floor(Math.pow(Math.random(),2)*Math.min(opts.length,8));
      const p=opts[take].p;
      grid=apply(grid,p);placed.push(p);
    }
    const b=bounds(placed);
    const score=placed.length*10000-b.area*3+Math.random()*50;
    if(!best||score>best.score)best={grid,placed,b,score};
    if(placed.length===unique.length&&trial>12)break;
  }
  // Greedy layouts can strand a word with a repeated stem. Search alternate crossings
  // before accepting a partial board; the finite budget keeps input responsive.
  if(best.placed.length<unique.length){
    let budget=12000;
    function complete(grid,placed,pending){
      if(!pending.length)return {grid,placed,b:bounds(placed)};
      if(--budget<0)return null;
      const next=pending.map(word=>({word,opts:choices(grid,placed,word)})).filter(v=>v.opts.length).sort((a,b)=>a.opts.length-b.opts.length);
      for(const {word,opts} of next)for(const {p} of opts.slice(0,32)){
        const found=complete(apply(grid,p),[...placed,p],pending.filter(w=>w!==word));if(found)return found;if(budget<0)return null;
      }
      return null;
    }
    const first={word:unique[0],r:Math.floor(MAX/2),c:Math.floor(MAX/2)-Math.floor(unique[0].length/2),d:'H'};
    const full=complete(apply(new Map(),first),[first],unique.slice(1));if(full)best=full;
  }
  // Перенесення всіх слів із незмінним напрямком читання і необов'язковим поворотом.
  const b=best.b;const transpose=Math.random()<.5;
  const finalWords=best.placed.map(p=>({word:p.word,r:transpose?p.c-b.minC:p.r-b.minR,c:transpose?p.r-b.minR:p.c-b.minC,d:transpose?(p.d==='H'?'V':'H'):p.d}));
  const out=new Map();for(const p of finalWords){for(let i=0;i<p.word.length;i++)out.set(key(p.r+(p.d==='V'?i:0),p.c+(p.d==='H'?i:0)),p.word[i]);}
  return {words:finalWords,cells:out,rows:transpose?b.maxC-b.minC+1:b.maxR-b.minR+1,cols:transpose?b.maxR-b.minR+1:b.maxC-b.minC+1};
}
function difficultyOf(p){return p.letters.length<=5?'easy':p.letters.length===6?'medium':'hard';}
function choosePack(){
  const filter=$('difficulty').value;
  const candidates=LEVELS.map((p,i)=>({p,i})).filter(v=>filter==='all'||difficultyOf(v.p)===filter).sort((a,b)=>a.p.letters.length-b.p.letters.length||a.i-b.i);
  if(!candidates.length)throw new Error('No packs for this difficulty');
  const completed=new Set(window.WordCircleAchievements.get().completed);
  let history=[];try{history=JSON.parse(localStorage.getItem('slovokolo-v5-recent-'+locale+'-'+filter)||'[]');if(!Array.isArray(history))history=[];}catch{}
  const unfinished=candidates.filter(v=>!completed.has(v.p.id));
  const pool=unfinished.length?unfinished:candidates;
  let options=pool.filter(v=>!history.includes(v.i)&&v.i!==state?.packIndex);
  if(!options.length)options=pool.filter(v=>v.i!==state?.packIndex);
  if(!options.length)options=pool;
  let recent=[];try{recent=JSON.parse(localStorage.getItem('slovokolo-variety-'+locale)||'[]');if(!Array.isArray(recent))recent=[];}catch{}
  const recentWords=new Set(recent.flatMap(id=>LEVELS.find(p=>p.id===id)?.main||[]));
  const last=LEVELS.find(p=>p.id===recent[0]);
  const rare={uk:'ФХЩБГҐЖЦЧШЇЄ',ru:'ФХЩБГЖЦЧШЭЁ',en:'QZXJVKWY'}[locale];
  function score(v){const shared=v.p.main.filter(w=>recentWords.has(w)).length/v.p.main.length;const repeatedLetters=last?[...new Set(v.p.letters)].filter(ch=>last.letters.includes(ch)).length/Math.max(last.letters.length,v.p.letters.length):0;return shared*8+repeatedLetters*2-[...new Set(v.p.letters)].filter(ch=>rare.includes(ch)).length*.18+Math.random()*1.2;}
  const chosen=options.map(v=>({v,score:score(v)})).sort((a,b)=>a.score-b.score)[0].v;
  history=[chosen.i,...history.filter(i=>i!==chosen.i)].slice(0,Math.max(1,candidates.length-1));
  recent=[chosen.p.id,...recent.filter(id=>id!==chosen.p.id)].slice(0,8);
  try{localStorage.setItem('slovokolo-v5-recent-'+locale+'-'+filter,JSON.stringify(history));localStorage.setItem('slovokolo-variety-'+locale,JSON.stringify(recent));}catch{}
  return chosen;
}
function buildNew(){
  meaningRequest++;meaning.hidden=true;
  const {p,i}=choosePack();const board=generateCrossword(p.main);
  const main=new Set(board.words.map(x=>x.word));
  // Пропущені генератором слова теж приймаються як бонусні, а не як помилки.
  const bonus=getBonus(p,main);
  state={pack:p,packIndex:i,board,main,bonus,solved:new Set(),hinted:new Set(),bonusFound:new Set(),tiles:shuffle([...p.letters]),usedHint:false,startedAt:Date.now()};
  selected=[];shownPuzzleCount++;updatePack();

  renderWheel();setStatus(tr('newmsg'));saveSession();
}
function rerollGrid(){
  const signature=b=>b.words.map(p=>`${p.word}:${p.r}:${p.c}:${p.d}`).join('|');
  const old=signature(state.board);
  let board=generateCrossword(state.pack.main);
  for(let tries=0;tries<10 && signature(board)===old;tries++)board=generateCrossword(state.pack.main);
  const oldBoard=state.board;
  state.board=board;
  state.main=new Set(board.words.map(p=>p.word));
  state.bonus=getBonus(state.pack,state.main);
  // Preserve solved words, bonuses and hint use across layout changes.
  const newHints=new Set();
  for(const k of state.hinted){const placement=oldBoard.words.find(p=>cellsOf(p).includes(k));if(!placement)continue;const index=cellsOf(placement).indexOf(k);const replacement=board.words.find(p=>p.word===placement.word);if(replacement)newHints.add(cellsOf(replacement)[index]);}
  state.hinted=newHints;
  selected=[];state.tiles=shuffle([...state.pack.letters]);updatePack();

  renderWheel();setStatus(tr('gridmsg'));saveSession();
}
function isOpen(k){return state.hinted.has(k)||state.board.words.some(p=>state.solved.has(p.word)&&cellsOf(p).includes(k));}
function renderGrid(){
  const {board}=state;
  const available=Math.min(560,root.getElementById('gridWrap').clientWidth-8);
  const compact=window.innerWidth<=720;
  const gap=compact?2:3;
  const maxHeight=compact?Math.min(230,Math.max(170,window.innerHeight*.27)):365;
  const cell=Math.min(46,Math.floor((available-gap*(board.cols-1))/board.cols),Math.floor((maxHeight-gap*(board.rows-1))/board.rows));
  crossword.style.setProperty('--cell',Math.max(10,cell)+'px');crossword.style.setProperty('--gap',gap+'px');
  crossword.style.setProperty('--cols',board.cols);crossword.style.setProperty('--rows',board.rows);
  const frag=document.createDocumentFragment();
  for(let r=0;r<board.rows;r++)for(let c=0;c<board.cols;c++){
    const k=key(r,c),ch=board.cells.get(k);const el=document.createElement('div');
    if(!ch){el.className='cell blank';el.setAttribute('aria-hidden','true');}
    else{const visible=isOpen(k);el.className='cell'+(visible?' revealed':'')+(state.hinted.has(k)?' hinted':'');el.textContent=visible?ch:'·';el.setAttribute('aria-label',visible?tr('letter',{ch}):tr('hidden'));}
    frag.append(el);
  }
  crossword.replaceChildren(frag);
}
function setStatus(text,kind=''){const el=$('message');el.textContent=text;el.className='message '+kind;}
function renderSelected(){current.replaceChildren();if(!selected.length){const t=document.createElement('span');t.className='placeholder';t.textContent=tr('empty');current.append(t);return;}
  selected.forEach((id,i)=>{const b=document.createElement('button');b.type='button';b.className='chosen';b.textContent=state.tiles[id];b.dataset.pos=i;b.title=tr('remove');b.setAttribute('aria-label',tr('removepos',{ch:state.tiles[id],n:i+1}));current.append(b);});}
function render(){
  renderSelected();wheel.querySelectorAll('.letter').forEach(b=>{const on=selected.includes(+b.dataset.i);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));b.title=on?tr('remove'):tr('letter',{ch:b.textContent});});
  lines.replaceChildren();const points=selected.map(i=>positions[i]);for(let i=1;i<points.length;i++){const el=document.createElementNS(ns,'line');el.setAttribute('x1',points[i-1].x);el.setAttribute('y1',points[i-1].y);el.setAttribute('x2',points[i].x);el.setAttribute('y2',points[i].y);lines.append(el);}
  $('progressLabel').textContent=tr('progress',{n:state.solved.size,total:state.board.words.length});$('progressBar').style.width=`${100*state.solved.size/state.board.words.length}%`;
  $('bonusLabel').textContent=tr('bonus',{n:state.bonusFound.size,total:state.bonus.size});
  const done=state.solved.size===state.main.size;
  $('newPuzzle').textContent=tr(done?'next':'new');
  if($('journey'))$('journey').textContent=tr('journey',{n:window.WordCircleAchievements.get().completed.filter(k=>k.startsWith(locale+':')).length,total:LEVELS.length});
  walletTop.textContent='★ '+wallet.balance;walletTop.title=tr('wallet',{n:wallet.balance});$('walletBalance').textContent=tr('wallet',{n:wallet.balance});$('walletHelp').textContent=tr('wallethelp');
  if($('wordbook')){const book=$('wordbook');book.hidden=false;const list=$('wordbookWords');list.replaceChildren();for(const word of [...state.solved,...state.bonusFound].sort())list.append(wordButton(word));const hidden=document.createElement('p');hidden.className='note';hidden.textContent=tr('hiddenbonus',{n:state.bonus.size-state.bonusFound.size});list.append(hidden);}
  const list=$('bonusList');list.replaceChildren();if(!state.bonusFound.size){const empty=document.createElement('span');empty.className='bonus-empty';empty.textContent=tr('bonushelp');list.append(empty);}else for(const w of state.bonusFound)list.append(wordButton(w));
  renderGrid();
}
function feedback(kind){if(options.feedback)options.feedback(kind);}
function toggleTile(i,autoCheck=false){
  feedback('tap');
  const at=selected.indexOf(i);
  if(at>=0){selected.splice(at,1);setStatus(tr('removed'));render();return;}
  selected.push(i);
  render();
  if(autoCheck)tryAutoSubmit();
  else setStatus(tr('submithelp'));
}
// Кліки автоматично зараховують завершене слово. Якщо цей самий початок
// веде до довшого слова, залишаємо вибір: продовжити набір або натиснути ✓.
function tryAutoSubmit(){
  const word=selected.map(i=>state.tiles[i]).join('');
  const valid=state.main.has(word)||state.bonus.has(word);
  if(!valid){setStatus(tr('continue'));return;}
  const possible=[...state.main,...state.bonus];
  if(possible.some(w=>w.length>word.length&&w.startsWith(word))){
    setStatus(tr('ambig',{word}),'good');
    return;
  }
  submitWord();
}
// Два незалежні способи вводу:
// 1) окремі натискання накопичують літери; завершене неоднозначне слово можна підтвердити кнопкою;
// 2) проведення з натиснутою кнопкою формує НОВЕ слово й перевіряє його тільки на pointerup.
// Поріг переміщення захищає звичайні тапи на телефоні від хибного розпізнавання як жесту.
const DRAG_THRESHOLD=11;
function renderWheel(){
  activeGesture=null;
  wheel.querySelectorAll('.letter').forEach(el=>el.remove());
  const tiles=state.tiles;
  positions=tiles.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/tiles.length;return{x:150+102*Math.cos(a),y:150+102*Math.sin(a)};});
  tiles.forEach((ch,i)=>{
    const b=document.createElement('button');b.type='button';b.className='letter';b.dataset.i=i;
    b.textContent=ch;b.style.left=`${positions[i].x/3}%`;b.style.top=`${positions[i].y/3}%`;
    b.setAttribute('aria-label',tr('letter',{ch}));
    listen(b,'pointerdown',e=>{
      if(activeGesture || (e.pointerType==='mouse' && e.button!==0))return;
      e.preventDefault();
      activeGesture={id:e.pointerId,first:i,startX:e.clientX,startY:e.clientY,drag:false};
      // Захоплення на незмінному контейнері гарантує pointerup навіть між кнопками.
      try{wheel.setPointerCapture(e.pointerId);}catch{}
    });
    listen(b,'click',e=>{if(e.detail===0)toggleTile(i,true);});
    listen(b,'keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggleTile(i,true);}
    });
    wheel.append(b);
  });
  render();
}
function nearbyTile(x,y){
  let best=-1,dist=Infinity;
  wheel.querySelectorAll('.letter').forEach((b,i)=>{
    const r=b.getBoundingClientRect(),d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2);
    if(d<dist){dist=d;best=i;}
  });
  return dist<35?best:-1;
}
function extendSwipe(i){
  if(i<0)return;
  const before=selected[selected.length-2];
  if(before===i){selected.pop();render();}
  else if(!selected.includes(i)){selected.push(i);render();}
}
listen(wheel,'pointermove',e=>{
  const g=activeGesture;
  if(!g||e.pointerId!==g.id)return;
  if(!g.drag){
    if(Math.hypot(e.clientX-g.startX,e.clientY-g.startY)<DRAG_THRESHOLD)return;
    g.drag=true;
    selected=[g.first]; // початок нового проведення, незалежно від попередніх натискань
    render();
  }
  extendSwipe(nearbyTile(e.clientX,e.clientY));
});
function finishGesture(e){
  const g=activeGesture;
  if(!g||e.pointerId!==g.id)return;
  activeGesture=null;
  if(g.drag){
    // Останню літеру також ураховуємо, навіть якщо pointermove не прийшов на точці відпускання.
    extendSwipe(nearbyTile(e.clientX,e.clientY));
    if(selected.length>=2)submitWord();
  }else{
    // Простий клік/тап: вибрати або прибрати одну літеру; наступні кліки накопичуються.
    toggleTile(g.first,true);
  }
}
function cancelGesture(e){
  if(activeGesture && e.pointerId===activeGesture.id){
    const wasDragging=activeGesture.drag;
    activeGesture=null;
    if(wasDragging){selected=[];render();setStatus(tr('cancel'));}
  }
}
listen(wheel,'pointerup',finishGesture);
listen(wheel,'pointercancel',cancelGesture);
listen(window,'pointerup',finishGesture);
listen(window,'blur',()=>{
  if(activeGesture){activeGesture=null;selected=[];if(state){render();setStatus(tr('interrupted'));}}
});
function submitWord(){if(!selected.length)return;const wasComplete=state.solved.size===state.main.size;const w=selected.map(i=>state.tiles[i]).join('');if(state.main.has(w)&&!state.solved.has(w)){state.solved.add(w);feedback('correct');setStatus(tr('found',{word:w}),'good');if(w.length>=7)recordAchievement('long_word');}
  else if(state.main.has(w))setStatus(tr('duplicate',{word:w}));
  else if(state.bonus.has(w)&&!state.bonusFound.has(w)){state.bonusFound.add(w);awardBonus(w);feedback('bonus');setStatus(tr('bonusfound',{word:w}),'good');recordAchievement('bonus',{word:w});}
  else if(state.bonus.has(w))setStatus(tr('bonusduplicate',{word:w}));
  else {feedback('wrong');setStatus(tr('unknown',{word:w}),'bad');}
  if(state.solved.has(w)||state.bonusFound.has(w))showMeaning(w);
  selected=[];render();if(!wasComplete&&state.solved.size===state.main.size){recordAchievement('complete',{usedHint:state.usedHint});setStatus(tr('win'),'good');render();}saveSession();}
listen(current,'click',e=>{const b=e.target.closest('button[data-pos]');if(!b)return;selected.splice(+b.dataset.pos,1);render();setStatus(tr('removed'));});
listen($('submit'),'click',submitWord);
listen($('clear'),'click',()=>{selected=[];render();setStatus(tr('cleared'));});
listen($('shuffle'),'click',()=>{shuffle(state.tiles);selected=[];renderWheel();setStatus(tr('shuffled'));saveSession();});
listen($('hint'),'click',()=>{const w=state.board.words.find(p=>!state.solved.has(p.word)&&cellsOf(p).some(k=>!isOpen(k)));if(!w){setStatus(tr('nohint'));return;}if(wallet.balance<3){setStatus(tr('poor'));return;}wallet.balance-=3;persistWallet();const k=cellsOf(w).find(k=>!isOpen(k));state.hinted.add(k);state.usedHint=true;render();setStatus(tr('hintused'));saveSession();});
listen($('newLayout'),'click',rerollGrid);listen($('newPuzzle'),'click',buildNew);listen($('difficulty'),'change',buildNew);
listen(document,'keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.composedPath()[0].tagName))return;if(e.key==='Backspace'&&selected.length){e.preventDefault();selected.pop();render();setStatus(tr('back'));}else if(e.key==='Escape'&&selected.length){e.preventDefault();selected=[];render();setStatus(tr('cleared'));}else if(e.key==='Enter'&&selected.length&&(e.target===document.body||e.target===root.host)){e.preventDefault();submitWord();}});
listen(window,'resize',()=>{if(state)renderGrid();});
listen($('language'),'change',e=>{saveSession();meaningRequest++;meaning.hidden=true;locale=e.target.value;try{localStorage.setItem('slovokolo-v5-locale',locale);}catch{}LEVELS=window.WordCircleData[locale];vocabulary=new Set(LEVELS.flatMap(p=>[...p.main,...p.bonus]));$('difficulty').value='all';updateTexts();if(!restoreSession())buildNew();});
try{const preference=options.locale||localStorage.getItem('slovokolo-v5-locale');if(window.WordCircleData[preference])locale=preference;}catch{}
LEVELS=window.WordCircleData[locale];vocabulary=new Set(LEVELS.flatMap(p=>[...p.main,...p.bonus]));$('language').value=locale;updateTexts();if(!restoreSession())buildNew();
return {destroy(){saveSession();controller.abort();activeGesture=null;},refresh(){renderGrid();},text:key=>tr(key)};
};
if(document.getElementById('wheel'))window.mountWordCircle();
