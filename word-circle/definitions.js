/* Definitions are loaded on demand from the language's Wiktionary (CC BY-SA).
   Only plain text is rendered; neither remote HTML nor scripts enter the app DOM. */
window.WordCircleDefinitions=(()=>{
'use strict';
const local={uk:{'акр':'Одиниця площі, приблизно 4047 квадратних метрів.','кар':'Чашоподібна заглибина в горах, утворена льодовиком.','фіакр':'Найманий кінний екіпаж для перевезення пасажирів.','фрегат':'Тип військового корабля; також назва великого морського птаха.','флюгер':'Прилад, який показує напрямок вітру.','фреска':'Настінний живопис фарбами по вологій штукатурці.','габро':'Темна магматична гірська порода.','гобой':'Дерев’яний духовий музичний інструмент із подвійною тростиною.','грифон':'Міфічна істота з тілом лева та головою й крилами орла.','ґедзь':'Кровосисна двокрила комаха.','ґніт':'Шнурок або смужка тканини, що підводить пальне до полум’я свічки чи лампи.','леміш':'Частина плуга, яка підрізає шар ґрунту знизу.','охра':'Природний жовтий або червонуватий пігмент на основі сполук заліза.','хітон':'Давньогрецький одяг на зразок довгої сорочки.','тхір':'Хижий ссавець родини куницевих.','щиглик':'Невеликий співочий птах із червоною плямою на голові та жовтою смугою на крилі.','щогла':'Вертикальна конструкція для вітрил або обладнання на судні.','щавель':'Трав’яниста рослина, багато видів якої мають кисле листя.','раб':'Людина, позбавлена особистої свободи та залежна від власника.'},ru:{},en:{}};
Object.assign(local.uk,{"фазан": "Птах із родини фазанових; самець має яскраве оперення та довгий хвіст.", "фікус": "Рід рослин родини шовковицевих; деякі види вирощують у кімнатах.", "флейта": "Духовий інструмент, звук у якому утворюється від струменя повітря біля краю отвору.", "фольга": "Дуже тонкий лист металу.", "фосфор": "Хімічний елемент із символом P; входить до складу багатьох речовин живих організмів.", "фах": "Професія або спеціальність людини.", "фрак": "Чоловічий парадний піджак із довгими фалдами ззаду.", "ховрах": "Невеликий норний гризун родини вивіркових.", "хрущ": "Жук із пластинчастими вусиками, личинки якого живуть у ґрунті.", "хміль": "Витка рослина, шишкоподібні суцвіття якої використовують у пивоварінні; також стан сп’яніння.", "хурма": "Плодове дерево та його солодкий помаранчевий плід.", "хлор": "Хімічний елемент із символом Cl; проста речовина є жовтувато-зеленим газом.", "хром": "Хімічний елемент із символом Cr; твердий блискучий метал.", "хаща": "Густі, важкопрохідні зарості.", "щебет": "Дзвінкі, швидкі звуки співу невеликих птахів.", "щипці": "Інструмент із двома з’єднаними частинами для захоплення або стискання.", "багор": "Довга жердина з металевим гаком на кінці.", "бандура": "Український струнний щипковий музичний інструмент.", "барвінок": "Вічнозелена сланка рослина, зазвичай із синіми квітками.", "борсук": "Норний хижий ссавець родини куницевих із темними смугами на голові.", "бурштин": "Викопна затверділа смола давніх дерев.", "гафній": "Хімічний елемент із символом Hf; сріблястий метал.", "гейзер": "Гаряче джерело, що періодично викидає воду й пару.", "глечик": "Посудина з опуклим тулубом, шийкою та ручкою.", "гравій": "Скупчення обкатаних дрібних уламків гірських порід.", "графіт": "М’яка темна форма вуглецю, яку використовують, зокрема, у стрижнях олівців.", "гусла": "Старовинний струнний музичний інструмент.", "ґанок": "Майданчик зі сходами перед входом до будинку.", "ґрунт": "Верхній пухкий шар земної кори, у якому ростуть рослини; також основа чогось.", "жорна": "Камені або пристрій для розмелювання зерна.", "жупан": "Старовинний верхній одяг із довгими полами.", "зяблик": "Невеликий співочий птах родини в’юркових.", "кобза": "Український струнний щипковий інструмент.", "кресало": "Сталеве знаряддя для викрешування іскор ударами об кремінь.", "личак": "Взуття, сплетене з лика — внутрішньої частини кори дерева.", "малахіт": "Зелений мінерал міді з характерним смугастим малюнком.", "рапіра": "Вид колючої холодної зброї; також спортивна фехтувальна зброя.", "сафір": "Коштовний різновид корунду, найчастіше синього кольору.", "яшма": "Щільна непрозора кремениста гірська порода, яку використовують як декоративний камінь."});
const memory=new Map();
function extract(html,lang){
 const doc=new DOMParser().parseFromString(html,'text/html');
 const headings=[...doc.querySelectorAll('h2,h3,h4,h5,h6')];let items=[];
 if(lang==='en'){
  const start=headings.find(h=>h.textContent.trim().replace(/\[.*?\]/g,'')==='English');
  if(!start)return null;
  const boundary=headings.find(h=>h.tagName==='H2'&&(start.compareDocumentPosition(h)&Node.DOCUMENT_POSITION_FOLLOWING));
  items=[...doc.querySelectorAll('ol > li')].filter(li=>(start.compareDocumentPosition(li)&Node.DOCUMENT_POSITION_FOLLOWING)&&(!boundary||(li.compareDocumentPosition(boundary)&Node.DOCUMENT_POSITION_FOLLOWING))&&!li.parentElement.closest('li'));
 }else{
  for(const h of headings.filter(h=>/^(Значення|Значение)(\s|$|\[)/.test(h.textContent.trim()))){
   const end=headings.find(n=>n!==h&&Number(n.tagName[1])<=Number(h.tagName[1])&&(h.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING));
   items.push(...[...doc.querySelectorAll('ol > li')].filter(li=>(h.compareDocumentPosition(li)&Node.DOCUMENT_POSITION_FOLLOWING)&&(!end||(li.compareDocumentPosition(end)&Node.DOCUMENT_POSITION_FOLLOWING))&&!li.parentElement.closest('li')));
   if(items.length)break;
  }
 }
 return items.filter(li=>!li.closest('.references,.reflist,.reference-text')).filter(li=>{if(lang!=='en')return true;const h=headings.filter(h=>h.compareDocumentPosition(li)&Node.DOCUMENT_POSITION_FOLLOWING).at(-1);return /^(Noun|Verb|Adjective|Adverb|Pronoun|Determiner|Numeral|Preposition|Conjunction|Interjection|Participle|Article|Suffix|Prefix|Symbol|Proper noun)(\s|$|\[)/.test(h?.textContent.trim()||'');}).map(li=>{const c=li.cloneNode(true);c.querySelectorAll('ul,ol,dl,table,sup,.mw-editsection').forEach(n=>n.remove());return c.textContent.split('◆')[0].replace(/\s+/g,' ').trim();}).filter(t=>t.length>3).slice(0,3).join('\n\n')||null;
}
async function lookup(lang,word,signal){
 const key=lang+':'+word.toLocaleLowerCase(lang);if(local[lang]?.[word.toLowerCase()])return local[lang][word.toLowerCase()];
 if(memory.has(key))return memory.get(key);
 try{const saved=JSON.parse(localStorage.getItem('wc-definition:'+key));if(saved?.text&&saved.time>Date.now()-30*86400000){memory.set(key,saved.text);return saved.text;}}catch{}
 try{
  const url='https://'+lang+'.wiktionary.org/w/api.php?'+new URLSearchParams({action:'parse',page:word.toLocaleLowerCase(lang),prop:'text',format:'json',formatversion:'2',redirects:'1',origin:'*'});
  const response=await fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(8000)])});if(!response.ok)return null;
  const data=await response.json();const text=extract(data.parse?.text||'',lang);
  if(text){memory.set(key,text);try{localStorage.setItem('wc-definition:'+key,JSON.stringify({time:Date.now(),text}));}catch{}}
  return text;
 }catch{return null;}
}
return {lookup,extract,isLocal:(lang,word)=>Boolean(local[lang]?.[word.toLowerCase()])};
})();
