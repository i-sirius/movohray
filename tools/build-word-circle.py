from pathlib import Path
import sys,os,json,re,zipfile,hashlib,itertools,collections,time,shutil
ROOT=Path(__file__).resolve().parents[1]
import tempfile,argparse
parser=argparse.ArgumentParser(description='Rebuild Slovokolo from bundled pinned Hunspell sources. Requires spylls==0.1.7.')
parser.add_argument('--cache-dir',type=Path,default=Path(tempfile.gettempdir())/'movohray-word-circle-build-8cfea')
args=parser.parse_args();BUILD=args.cache_dir;BUILD.mkdir(parents=True,exist_ok=True)
revision='8cfea406b505e4d7df52d5a19bce525df98c54ab'
(BUILD/'revision.txt').write_text(revision)
for lang in ['uk','ru','en']:
 with zipfile.ZipFile(ROOT/'word-circle/sources'/(lang+'-hunspell.zip')) as source:
  for original,suffix in [('index.aff','index.aff'),('index.dic','index.dic'),('LICENSE','license'),('README.md','readme.md')]:
   (BUILD/(lang+'-'+suffix)).write_bytes(source.read(original))
 shutil.copyfile(BUILD/(lang+'-index.aff'),BUILD/(lang+'.aff'))
 shutil.copyfile(BUILD/(lang+'-index.dic'),BUILD/(lang+'.dic'))
from spylls.hunspell import Dictionary
with zipfile.ZipFile(ROOT/'word-circle/sources/frequency.zip') as z:
 for lang in ['uk','ru','en']:(BUILD/(lang+'-frequency.txt')).write_bytes(z.read(lang+'_50k.txt'))
 for original,name in [('REVISION','frequency-revision.txt'),('README.md','frequency-readme.md'),('LICENSE-CC-BY-SA-4.0.txt','frequency-license.txt')]:(BUILD/name).write_bytes(z.read(original))
seed_file=ROOT/'word-circle/seed-levels.json'
if not seed_file.exists():
 text=(ROOT/'word-circle/levels.js').read_text(encoding='utf-8');seed_file.write_text(json.dumps(json.loads(text.split('window.WordCircleData =',1)[1].strip().rstrip(';')),ensure_ascii=False,indent=2),encoding='utf-8')
seeds=json.loads(seed_file.read_text(encoding='utf-8'))
short={
'uk':'акт арка аркуш атом аура банк бант бар барс бік бій біль бір біс боб бог борт борщ брак брат брук бук бунт буря бути вага вата вежа верх вино вік віра віск вода воля вовк вухо гай газ гак гарт гість гнів гора грак гра град грам гриб грім гук гул гуска далі дах двір день диво дим дім дно доза доля дощ друг дуб дуга дух душ дяк жар жарт жах жито жук зал зала заєць зима зло знак знов зоря зуб іва ікра імла іней ірис їжа їжак йод кавун кава каша каштан кедр кило кіт кіно клен клоп клуб кнут код коло кома кора корт кран крик кріт кров крок кущ куля кум купа курс кут лад лава лак лампа лан лань лапа лев лід лік ліс літо лоб лоза луг лук луна льон люд мак мати мед мех мир мис мить міна міст міф мова море морс мох мука мул мур муха ніс ніж ніч нога нора нота овес око оса пара парк пас пень пиво пила пісня плід плуг поле порт пост птах пух раб рай рак рама рана ранок раса риба рис рік рід рій річ ріг ріка ріст роса рот рух рука руно сад сало сам сани село сік сіль сівба сіно слід слон смак сніг сніп сон сорт соус сота спір срам став стан стіл стік стогін стриж струм сума суп суть тато такт танк тема тент тест тил тип тир тиск тісто тінь тік тло тон торт торф трос труд туга тунець тур тупіт туша удар узор укус урок урна уста факт фара фата фах фен фірма флот фон фрак хата хід хліб хмара ховрах хор хорт хрущ хутір цар ціна ціп цукор час чат чай чаша чек чин чип чуб чудо шум шина шифр шов шок шрам шлях щит щука щур юнак юшка явір язик яма яр ярмо ярус',
'ru':'акт арка атом аура банк бант бар барс бег беда бобр бог боец бой бок боль бор борт брак брат бред брус бук бунт буря быть ваза вата век вена верх вес веха вид виза вино виск вкус внук вода волк воля вор враг врач воск вши вход выход вяз газ гай гам гарь ген гимн глаз гнев год гол гора горе горн гость град граф гриб гром грош груз гусь гуща дар дата дача двор день дело джаз джин джип диво дно долг доля дом доза друг дуб дуга дух душ дым дыра еда ель ёж жар жало жаль жанр жгут жест жир жито жук зал замок зуб зима зло знак зной игра игла иней иск икра ил йод кадр кайф кара карта каша квас кедр кино кит клан клён клей клин клок клон клуб ключ кнут ковш кожа коза кокон кол ком кома конь кора корм корт кот кофе кран край крем крик крот круг куб кум курс куст кут лак лапа лев лес лещ лён лира лист лоб ложь лоза лом лось лот луг лужа лук луч лыжа мак март мать мёд мех мир миска миф миг мина мост мох мул мука мыло мышь мяч небо нерв нива нить нож нос нога нора нота ночь нуль овёс овод ода окно омар омут опыт орёл оса ось охра очаг очко пакт панк пар пара парк пасть паук пена пень перо пёс печь пир пила пик пирс план плод плов плот плуг плюс пол поле порт пост поэт прах пруд прут путь пух пыль раб рай рак рама рана раса рис рог род рой рок рот роса рост рука руно русло рыба рык рысак сад сало сани свет село сено сеть сечь сидр сила сито скат скот слог слой слон смех смог сноп снег сок соль сон сорт соус сова спор спуск стаж стая стог стол стон сток стул суд сук сумма суп суть сыр сын таз такт танк тень тело тема темп тест тина тип тир тиск тмин тога ток толк том тон торг торф торт трос трон труд туз тушь тыл тюк угол уголь удар узел укус улей улов урок урна утка уха ухо факт фара фата фен фея фикус флаг флот фон фрак хаос хвоя хлеб хлев ход хор храп хрен хром храм хруст царь цвет цех цепь цирк час чай чан чаша чек чело чин чип чуб чудо чуть шаль шар шейх шило шина шип ширь шов шок шрам штык шум щель щит щука щуп ядро язык якорь яма ярус',
'en':'act add age ago aid aim air ale all amp and ant any ape apt arc are ark arm art ash ask ate awe awl axe bad bag ban bar bat bay bed bee beg bet bid big bin bit boa bob bog boo bow box boy bra bud bug bun bus but buy cab cad can cap car cat cob cod cog con coo cop cor cos cot cow coy cry cub cue cup cur cut dab dad dam day den dew did die dig dim din dip doe dog don dot dry dub dud due dug dun duo dye ear eat ebb eel egg ego elf elk elm end eon era ere err eve ewe eye fad fan far fat fax fed fee fen few fib fig fin fir fit fix flu fly foe fog for fox fry fun fur gab gag gal gap gas gel gem get gig gin gnu gob god goo got gum gun gut guy gym had hag ham hap has hat hay hem hen her hew hex hey hid him hip his hit hob hog hop hot how hub hue hug huh hum hut ice icy ill imp ink inn ion ire irk ivy jab jam jar jaw jay jet jib jig job jog jot joy jug jut keg ken key kid kin kit lab lad lag lap law lax lay lea led lee leg lei let lid lie lip lit lob log loo lop lot low lug lye mad mag man map mar mat maw max may men met mew mid mix mob mod mom moo mop mow mud mug mum nab nag nap nay net new nib nil nip nit nix nod nor not now nub nun nut oak oar oat odd ode off oft oil old one opt orb ore our out ova owe owl own pad pal pan pap par pat paw pay pea peg pen pep per pet pew pie pig pin pip pit ply pod pop pot pow pro pry pub pug pun pup pus put rag ram ran rap rat raw ray red ref rib rid rig rim rip rob rod roe rot row rub rue rug rum run rut rye sad sag sap sat saw sax say sea see set sew sex she shy sin sip sir sit six ski sky sly sob sod son sop sot sow soy spa spy sty sub sue sum sun sup tab tad tag tan tap tar tat tax tea tee ten the thy tic tie tin tip toe tog tom ton too top tor tot tow toy try tub tug two urn use van vat vet vex via vie vow wad wag wan war was wax way web wed wee wet who why wig win wit woe wok won woo wow wry yak yam yap yaw yea yen yes yet yew yin you zap zen zip zoo able acid acre aged also area army atom aunt away baby back bake bald ball band bank bare bark barn base bath bead beak beam bean bear beat beef beer bell belt bend bent best bias bike bill bind bird bite blow blue boat body boil bold bolt bomb bond bone book boom boot born boss both bowl bulk bull bump burn bush busy cage cake calf call calm came camp cane cape card care cart case cash cast cave cell cent chat chef chew chin chip city clam clay clip clot club clue coal coat code coil coin cold cole colt comb come cook cool cope copy cord core cork corn cost cosy crab crew crop crow cube curb cure curl cute dare dark dart dash data date dawn days dead deal dear debt deck deed deep deer deli dent desk dial dice diet dirt dish dive dock does doll dome done door dose dove down drag draw drew drip drop drug drum duck duct dull dumb dune dusk dust duty each earn ease east easy echo edge edit else even ever evil exam exit face fact fail fair fake fall fame fare farm fast fate fear feed feel feet fell felt fern file fill film find fine fire firm fish fist five flat flea fled flew flex flip flow foam foil fold folk food fool foot ford fore fork form fort foul four free frog from fuel full fund fuse gain gale game gang gate gave gaze gear gene gift girl give glad glow glue goal goat goes gold golf gone good gore gown grab gram gray grew grey grid grim grin grip grow gulf gull gust guys hail hair half hall halt hand hang hard hare harm harp hate have haze head heal heap hear heat heel held hell helm help herb herd here hero hide high hike hill hint hire hold hole holy home hood hook hoop hope horn hose host hour huge hull hung hunt hurt hymn idea idle inch into iron item jack jail jazz jeep jerk jest join joke jump junk jury just keen keep kept kick kill kind king kiss kite knee knew knit knot know lace lack lady laid lake lamb lame lamp land lane last late lawn lead leaf leak lean leap left lend lens less life lift like limb lime limp line link lion list live load loaf loan lock loft logo lone long look loop lord lore lose loss lost loud love luck lump lung lure lush lust made maid mail main make male mall malt many mare mark mars mask mass mast mate math maze meal mean meat meet melt memo mend menu mere mesh mess mild mile milk mill mind mine mint miss mist mode mold mole mood moon moor more most moth move much mule must myth nail name navy near neat neck need nest news next nice nine node none noon norm nose note noun obey odds odor once only onto open oral ours oval oven over pace pack pact page paid pain pair pale palm pane pant park part pass past path peak pear peat peel peer pest pick pier pile pill pine pink pipe plan play plea plot plow plug plum plus poem poet pole poll polo pond pony pool poor pope pork port pose post pour pray prey prop pull pulp pump pure push race rack raft rage raid rail rain rake ramp rang rank rare rash rate read real rear reef reel rent rest rice rich ride ring ripe rise risk road roam roar robe rock rode role roll roof rook room root rope rose rosy rule rush rust sack safe said sail sake sale salt same sand sang sank save scan scar seal seam seat seed seek seem seen self sell send sent shed ship shoe shop shot show shut sick side sigh sign silk sing sink site size skin skip slab slam slap slat sled slim slip slit slot slow slug snap snow soap sock soda sofa soft soil sold sole solo some song soon sore sort soul soup sour span spar spat spin spit spot star stay stem step stew stir stop stub stun such suit sure surf swap swan swim tail take tale talk tall tame tank tape task team tear tell tend tent term test text than that thaw thee them then they thin this tide tidy tied tile till tilt time tiny tire told toll tone took tool torn tour town trap tray tree trek trim trio trip true tube tuna tune turn twin type ugly undo unit unto upon urge used user vain vale vary vase vast veal veil vein verb very vest veto vice view vine visa void vote wage wait wake walk wall want ward ware warm warn warp wash wasp wave ways weak wear weed week well went were west what when whip whom wide wife wild will wind wine wing wink wipe wire wise wish with woke wolf womb wood wool word wore work worm worn wrap yard yarn yeah year yell yoga your zero zest zinc zone zoom'
}
# Family-friendly exclusion policy, applied to expanded forms as well as base words.
roots=['бляд','блят','пизд','хуй','хуя','хує','хуе','хую','хуї','ебат','ебал','їбат','їбав','єбат','fuck','shit','cunt','dick','nigg','porno']
exact={'срака','сраки','срак','сука','суки','сучка','сучки','мудак','мудаки','говно','гівно','дроч','penis','cock','sex','sexy','porn'}
letters={'uk':r'[а-щьюяєіїґ]+','ru':r'[а-яё]+','en':r'[a-z]+'}
def ok(w,lang):return 3<=len(w)<=7 and re.fullmatch(letters[lang],w) and w not in exact and not any(root in w for root in roots)
def apply_rule(w,a,prefix):
 if not a.cond_regexp.search(w):return None
 if a.strip and not (w.startswith(a.strip) if prefix else w.endswith(a.strip)):return None
 if prefix:return a.add+w[len(a.strip):]
 return (w[:-len(a.strip)] if a.strip else w)+a.add
all_levels={};manifest={'sourceRevision':(BUILD/'revision.txt').read_text().strip(),'frequencyRevision':(BUILD/'frequency-revision.txt').read_text().strip(),'spylls':'0.1.7','languages':{}}
out=ROOT/'word-circle';(out/'licenses').mkdir(exist_ok=True);(out/'sources').mkdir(exist_ok=True)
for lang in ['uk','ru','en']:
 start=time.monotonic();cache=BUILD/(lang+'-expanded.json')
 print('LOADING',lang,flush=True)
 if cache.exists():lex=set(json.loads(cache.read_text(encoding='utf-8')))
 else:
  dic=Dictionary.from_files(str(BUILD/lang))
  blocked={getattr(dic.aff,k,None) for k in ['FORBIDDENWORD','NOSUGGEST','ONLYINCOMPOUND']}-{None}
  candidates=set()
  for entry in dic.dic.words:
   w=entry.stem
   if w!=w.lower() or not re.fullmatch(letters[lang],w) or len(w)>13 or blocked&entry.flags:continue
   if ok(w,lang):candidates.add(w)
   suffixes=[];prefixes=[]
   for flag in entry.flags:
    for rule in dic.aff.SFX.get(flag,[]):
     v=apply_rule(w,rule,False)
     if v and len(v)<=10 and not (blocked&rule.flags):
      suffixes.append((v,rule))
      if ok(v,lang):candidates.add(v)
      for more in rule.flags:
       for again in dic.aff.SFX.get(more,[]):
        v2=apply_rule(v,again,False)
        if v2 and ok(v2,lang):candidates.add(v2)
    for rule in dic.aff.PFX.get(flag,[]):
     v=apply_rule(w,rule,True)
     if v and len(v)<=10 and not (blocked&rule.flags):
      prefixes.append((v,rule))
      if ok(v,lang):candidates.add(v)
   for v,rule in suffixes:
    if not rule.crossproduct:continue
    for flag in entry.flags|rule.flags:
     for pre in dic.aff.PFX.get(flag,[]):
      if pre.crossproduct:
       v2=apply_rule(v,pre,True)
       if v2 and ok(v2,lang):candidates.add(v2)
   for v,rule in prefixes:
    for flag in rule.flags:
     for post in dic.aff.SFX.get(flag,[]):
      v2=apply_rule(v,post,False)
      if v2 and ok(v2,lang):candidates.add(v2)
  print(lang,'candidates',len(candidates),'validating',flush=True)
  lex={w for w in candidates if dic.lookup(w)}
  cache.write_text(json.dumps(sorted(lex),ensure_ascii=False),encoding='utf-8')
 supplement=json.loads((ROOT/'word-circle/verified-supplement.json').read_text(encoding='utf-8'))[lang]
 editorial={entry['word'] for entry in supplement if ok(entry['word'],lang)}
 lex.update(editorial)
 print(lang,'accepted',len(lex),'elapsed',round(time.monotonic()-start),flush=True)
 # Curated target pools from this app; dictionary verification remains a required gate.
 existing=json.loads((ROOT/({'uk':'wordguess.json','ru':'wordguess-ru.json','en':'wordguess-en.json'}[lang])).read_text(encoding='utf-8'))
 core=set(short[lang].split())|{w.lower() for mode in existing['modes'].values() for w in mode['answers']}
 core|={w.lower() for pack in seeds[lang] for w in pack['main']+pack['bonus']}
 frequency={}
 for line in (BUILD/(lang+'-frequency.txt')).read_text(encoding='utf-8').splitlines():
  parts=line.rsplit(' ',1)
  if len(parts)==2 and parts[1].isdigit():frequency[parts[0]]=int(parts[1])
 threshold={'uk':5,'ru':30,'en':30}[lang]
 blocked_main=set()
 app=(ROOT/'app.js').read_text(encoding='utf-8')
 label={'uk':'WORD_GUESS_BLOCKED_TARGETS','ru':'WORD_GUESS_BLOCKED_RU_TARGETS'}.get(lang)
 if label:
  block=app.split('const '+label+' = new Set([',1)[1].split(']);',1)[0]
  blocked_main.update(re.findall(r'"([^"]+)"',block))
 if lang=='en':blocked_main.update('apt amp awl bra cad cob cog con coo cor cos cur dab dub dud dun ebb eon ere err fen gab gal gnu gob hag hap hew hob huh imp ire irk jab jib ken lea lee lei lye mar maw mew mod nab nay nib nip nit nix nub oft ova pap par pew ply pow pro pry pug pun pus ref roe rue rut rye sax sop sot sow sty sup tat tee thy tic tog tor tot urn vie wad wan yap yaw yea yen yew yin zen'.split())
 # Include frequency-attested dictionary lemmas, with a broader editorial discovery pool.
 dic=Dictionary.from_files(str(BUILD/lang))
 stems={e.stem for e in dic.dic.words if e.stem==e.stem.lower() and ok(e.stem,lang)}
 discovery={'uk':'фіакр фрегат фазан фікус флейта флюгер фреска фосфор фольга фахівець ховрах хрущ хміль хурма хижак хмара халва хітон хлор хром хребет хустка хаща щавель щебет щиглик щогла щедрик щипці щітка борсук бобер брунат бурштин бублик бандура барвінок багор багряне габро гафній гейзер глечик гобой гравій графіт гриф грифон гусла ґанок ґедзь ґніт ґрунт ґудзик жорна жупан зяблик кобза кресало леміш личак малахіт охра пектораль рапіра сафір скіф сфера тхір чабан чапля яшма'.split(),'ru':'фрегат фазан фикус флейта флюгер фреска фосфор фольга хруст хром хлор хорёк хребет хижина щавель щегол щебет щётка барсук бобёр бурштин бублик габбро гафний гейзер гобой гравий графит гриф грифон гусли'.split(),'en':'quartz quiver quail quirky glyph sphinx zephyr zircon jigsaw jackal fjord foxglove fuchsia waxwing hyphen hazelnut'.split()}[lang]
 core.update(stems & {w for w,n in frequency.items() if n>= {'uk':12,'ru':80,'en':100}[lang]})
 core.update(set(discovery)&stems)
 core={w for w in core if w not in editorial and ok(w,lang) and w in lex and frequency.get(w,0)>=threshold and w not in blocked_main}
 def ranking(w):return (-len(w),-frequency.get(w,0),w)

 groups=collections.defaultdict(list)
 for w in sorted(lex):groups[''.join(sorted(w))].append(w)
 def subwords(w):
  counts=collections.Counter(w);keys=list(counts);found=set()
  for sizes in itertools.product(*(range(counts[ch]+1) for ch in keys)):
   if not 3<=sum(sizes)<=7:continue
   sig=''.join(sorted(''.join(ch*n for ch,n in zip(keys,sizes))))
   found.update(groups.get(sig,[]))
  return found
 levels=[];seen=set();audit=[]
 previous=json.loads((out/'released-levels-v6.json').read_text(encoding='utf-8'))[lang]
 for old in previous:
  levels.append(old);seen.add(''.join(sorted(old['letters'].lower())))
 for pack in seeds[lang]:
  wheel=pack['letters'].lower();found=subwords(wheel)
  removed=[w for w in pack['main']+pack['bonus'] if w.lower() not in lex]
  audit.extend(removed)
 # Grow stable, progressively ordered packs with 3–7 familiar main answers.
 choices=[]
 for wheel in sorted(core,key=lambda w:(len(w),w)):
  if not 4<=len(wheel)<=7:continue
  sig=''.join(sorted(wheel))
  if sig in seen:continue
  found=subwords(wheel);common=found&core
  if len(common)<3:continue
  main=[wheel]+sorted(common-{wheel},key=ranking)[:4]
  # Avoid requiring two different inflections of the same long base as separate targets.
  choices.append((len(wheel),-len(common),wheel,main,found))
 selected=[]
 # Greedy coverage adds new vocabulary and rare letters rather than more dense anagrams.
 used=collections.Counter(w.lower() for level in levels for w in level['main'])
 rare={'uk':'фхщбгґжцчшїє','ru':'фхщбгжцчшэё','en':'qzxjvkwy'}[lang]
 for size,quota in [(4,50),(5,120),(6,180),(7,200)]:
  pool=[v for v in choices if v[0]==size]
  for _ in range(min(quota,len(pool))):
   def diversity(v):
    return sum(1/(1+used[w]) for w in v[3])*3+sum(1 for c in set(v[2]) if c in rare)*2+(1 if v[2] in discovery else 0)
   item=max(pool,key=lambda v:(diversity(v),frequency.get(v[2],0),v[2]))
   selected.append(item);pool.remove(item);used.update(item[3])
 for size,_,wheel,main,found in sorted(selected,key=lambda v:(v[0],v[2])):
  sig=''.join(sorted(wheel))
  if sig in seen:continue
  seen.add(sig);levels.append({'id':lang+':'+sig,'letters':wheel.upper(),'main':[w.upper() for w in main],'bonus':[w.upper() for w in sorted(found-set(main))]})
 all_levels[lang]=levels
 vocabulary=sorted({w for pack in levels for w in pack['main']+pack['bonus']})
 (out/('lexicon-'+lang+'.json')).write_text(json.dumps(sorted(w.upper() for w in lex),ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 (out/'licenses'/(lang+'.txt')).write_bytes((BUILD/(lang+'-license')).read_bytes())
 manifest['languages'][lang]={'levels':len(levels),'coreWords':len(core),'editorialBonusForms':len(editorial),'frequencySha256':hashlib.sha256((BUILD/(lang+'-frequency.txt')).read_bytes()).hexdigest(),'lexiconWords':len(lex),'playableWords':len(vocabulary),'mainWords':len({w for p in levels for w in p['main']}),'removedSeedEntries':sorted(set(audit)),'sha256':{name:hashlib.sha256((BUILD/(lang+'-'+name)).read_bytes()).hexdigest() for name in ['index.aff','index.dic','license']}}
 print(lang,manifest['languages'][lang],flush=True)
(out/'levels.js').write_text('/* Generated by tools/build-word-circle.py. Dictionary-derived data: see licenses and sources. */\nwindow.WordCircleData = '+json.dumps(all_levels,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(out/'dictionary-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(out/'licenses/frequency.txt').write_bytes((BUILD/'frequency-license.txt').read_bytes())
import runpy
runpy.run_path(str(ROOT/'tools/classify-word-circle.py'),run_name='__main__')
print('DONE',flush=True)
