# Мовограй

## 0.6.6

- Alias/Крокодил: набір великих карток збільшено з 8 до 16 форм; додано амебу, корал, комету, морську зірку, картоплину, хвилю, медузу та метеорит. Нові форми доступні в тому самому селекторі й беруть участь у випадковій ротації.
- `words.json` розширено більш ніж на 550 нових записів. Кожна з 26 тем тепер має щонайменше 80 унікальних однословних easy+medium елементів, щоб дефолтний режим без словосполучень рідше доходив до повторного кола.
- Production-звуки повністю замінено: замість коротких аркадних OGG використовується оригінальний м’який acoustic/UI MP3-набір із дерев’яними ударами, повітряними свіпами, теплими акордами та стриманими фінальними сигналами.
- MP3 використовується як основний формат для кращої сумісності зі старими Safari/iOS; Web Audio tone patterns залишено лише як аварійний fallback.
- PWA revision: `0.6.6-20260825`; cache: `movohray-cache-v0.6.6-b20260825`.

## 0.6.4

- «Вгадай слово» суттєво розширено: український режим і експериментальні RU/EN Labs мають окремі словники, локалізовані клавіатури, правила, підказки, результати й службові повідомлення.
- Labs відкривається як Easter Egg після багаторазового натискання на версію та має окрему повноекранну анімацію розблокування. Поточні локалі Word Guess — UA/RU/EN; інтерфейс побудовано через спільну locale-table з українським fallback і перевіркою повноти ключів.
- Словники Word Guess розширено; цільові пули для UA — 603/280/243, RU Labs — 918/902/855, EN Labs — 871/864/909 слів для довжин 5/6/7 відповідно. RU/EN використовують широкі allowed-словники для перевірки допустимих спроб.
- Підказки оформлено як три зрозумілі рівні, локалізовано та розбито на окремі рядки; наступна доступна підказка може ненав’язливо підсвічуватись після використання попередньої або тривалої паузи.
- Недопустимі слова отримали виразні staged-анімації з різними ефектами для літер, включно з particle/dust-розпадом; основне повідомлення про помилку показується довше й контрастніше, а декоративні comic-reactions не перекривають його.
- Перемога має розширені confetti/fireworks, emoji, sparkles і glow-ефекти. Share результату формує PNG-картку з реальним полем спроб і використовує системний Share API, коли браузер підтримує передачу файлів.
- Додано 210 локальних Achievement: звичайні, накопичувальні, кумедні та секретні. Загадкові плитки можуть після прихованої серії натискань розкрити точну умову, не видаючи саму нагороду. Achievement-toast показується довго та відкриває колекцію одразу на отриманій нагороді.
- Кнопка досягнень компактно показує прогрес `X/210` поруч із глобальними налаштуваннями на головних/підготовчих екранах і не заважає під час активної гри.
- У налаштуваннях додано повне скидання локального прогресу/налаштувань. Додано локальну заглушку зворотного зв’язку розробнику: bug report, like/dislike та скарга на конкретне слово з технічним контекстом для майбутньої серверної відправки.
- Додано dormant `wordguess-session.js` та `WORD_GUESS_SESSION_PROTOCOL.md` як основу для майбутнього режиму на час і серверних сесій 2–5 гравців (realtime/turn-based). Поточний UI та локальний classic-режим не змінені.
- Фоновий doodle-pattern працює в темній і світлій темах; виправлено wide-screen геометрію, стабільність масштабу поля після першого введення, dropdown setup, touch-зони та інші mobile/wide UX-деталі.
- PWA revision: `0.6.4-20260816`; cache: `movohray-cache-v0.6.4-b20260816`; `version.json` має `required: true`.

## 0.6.3a
- Hotfix мобільної геометрії карток Alias/Крокодила: фізична шайба більше не розтягується на всю висоту великої gesture-зони.
- Адаптація під довгі слова й словосполучення збережена по ширині; на телефонах висота токена обмежена й масштабується від його фактичної ширини.
- Службові бейджі та підказки залишаються нерухомими, а свайп-анімація рухає лише форму зі словом.

## 0.6.3
- «Вгадай слово»: додано захисний список небажаних слів для загадування та очищено цільові словники від очевидних прикметників/прислівників, власних назв, русизмів, некоректних форм і частини невдалих зменшувальних форм; `нотка` та `чужий` також вилучені з допустимих спроб.
- Глобальна кнопка налаштувань тепер доступна на всіх основних екранах і результатах, має тихіше оформлення та не дублюється локальними кнопками в setup-екранах; під час обов’язкового оновлення вона приховується.
- Desktop-результат «Вгадай слово» отримав визначену висоту viewport-контейнера: середня частина прокручується окремо, а нижні кнопки залишаються в межах екрана.
- Клітинки та клавіатура «Вгадай слово» стали менш округлими й легшими візуально; тіні послаблено без переходу до гострих прямокутників.
- Flip відкриття літер пришвидшено до 300 мс із 50 мс stagger; момент зміни стану синхронізовано з серединою анімації.

## 0.6.2
- Активний екран «Вгадай слово» отримав content-first responsive-компонування: центрована ігрова колонка віддає доступну ширину полю та клавіатурі, а не декоративній оболонці.
- Поле для слів із 5, 6 і 7 літер заповнює ширину колонки адаптивними клітинками; для старих iOS збережено явний fallback розмірів.
- Ієрархію спрощено до компактного HUD, головного ігрового поля та тихіших другорядних дій із меншою кількістю вкладених поверхонь, рамок і тіней.
- Перевірені літери відкриваються послідовним flip-ефектом; `prefers-reduced-motion` прибирає рух і показує підсумкові стани без затримки.
- Екран результату починається вище у viewport, зберігає логічну послідовність підсумку та дозволяє природне прокручування довгого вмісту.
- Для майбутнього visual-system pass рекомендовано поширити на інші режими content-first width, компактний HUD, один домінантний ігровий елемент, тихіші secondary actions, узгоджені радіуси й сильнішу whitespace-ієрархію; у 0.6.2 інші режими та головне меню не перероблялися.

## 0.6.1
- PWA-ресурси переведено на build-aware revision `0.6.1-20260813`, а назву кешу — на `movohray-cache-v0.6.1-b20260813`.
- Precache розділено на обов'язковий shell зі словниками та best-effort manifest, іконки й OGG-звуки, щоб збій необов'язкового ресурсу не скасовував установлення service worker.
- Прибрано безумовний `skipWaiting` під час install; кероване оновлення через повідомлення `SKIP_WAITING`, network-first HTML, network-only `version.json` та очищення старих кешів збережено.
- Runtime-запис до кешу прив'язано до lifetime fetch-події через `event.waitUntil()` і обмежено поточною revision.
- Для новішої revision `required: true` відкриває блокувальне оновлення, а `required: false` лише один раз показує неблокувальне повідомлення; реєстрацію service worker зроблено ідемпотентною та обмежено scope застосунку.
- Динамічні імена гравців, команд, ролі та категорії переведено з `innerHTML` на безпечні DOM API.
- Таймери Alias, Крокодила та «Хто я?» переведено на absolute deadline з точним pause/resume під час blocking modal, виходу та переходу застосунку у background.
- Відновлення sound preference підключено до boot; synthetic Web Audio fallback для несумісних OGG збережено.
- Додано точкові iOS 12 fallback-правила для `inset`, `aspect-ratio`, критичних `clamp()` і flex-gap; словникові запити дедупліковано, а request guards захищають вибір режиму та запуск «Вгадай слово» від застарілої async-відповіді.

## 0.6.0
- Мобільну оболонку розширено до доступної ширини екрана для меню, setup-екранів, активних ігор і результатів.
- Фінал «Вгадай слово» перебудовано як окремий native-like екран зі статистикою, адаптивним полем спроб, share-кнопкою у верхній панелі та нижньою панеллю дій.
- Додано централізовану логіку повернення, синхронізацію значущих екранів через History API та edge-swipe у standalone PWA.
- Додано safe-area відступи, touch feedback, переходи екранів, reduced-motion режим і універсальний toast.
- Активний екран «Хто я?» адаптовано до висоти mobile viewport: роль, основні відповіді та компактна панель додаткових дій доступні без довгого прокручування.
- Виправлено вертикальне розтягування кнопок в активних раундах Alias і Крокодила зі збереженням повноширинної мобільної оболонки.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.6.0` (build `2026-08-11`).

## 0.5.5
- Виправлено фінальний overlay «Хто я?»: стабільне центрування на desktop/mobile, без горизонтального скролу й зміщення після resize.
- Додано спільний renderer фінальних результатів для командних ігор із podium для 1/2/3 місця та коректною обробкою нічиєї.
- Застосовано нове оформлення результатів до Alias, командного Крокодила «На час» і змагального «Хто я?».
- Уніфіковано setup-header усіх режимів: правила `?` і глобальні налаштування `⚙️` тепер стоять поруч без конфлікту з плаваючою кнопкою.
- Розширено централізовану Web Audio систему: один AudioContext, master volume, окремі події для UI, раундів, відповідей, countdown і фіналів.
- Перероблено звукову палітру: м’якший correct chime, кумедніший skipped/boop, тихіші UI-події та довші envelopes без різких clicks.
- Додано production-набір OGG-звуків Kenney CC0 з AudioBuffer cache і Web Audio fallback; перед остаточною iOS 12-перевіркою потрібна MP3-конвертація вибраних файлів.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.5`.

## 0.5.4
- Розширено словник ролей `whoami.json`: 408 ролей загалом і 312 ролей у дефолтному наборі easy+medium.
- У setup “Хто я?” формат “Телефон на лобі” став першим і дефолтним.
- Вирівняно блок “Гравці”: компактний вибір кількості 2–12, єдиний стиль кнопок і більший шрифт.
- Додано зелену галочку для вибраних категорій ролей.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.4`.

## 0.5.3
- У режимі “Хто я?” прибрано третю відповідь: у раунді лишилися симетричні “Так” і “Ні” та окрема дія “Відгадав роль”.
- Додано зміну ролі у “Хто я?” без дублювання дій Alias/Крокодила.
- Перепрацьовано темну палітру картки “Хто я?”, фінальний overlay, setup-actions і compact setup з модальним редагуванням гравців та категорій.
- Виправлено клавіатуру “Вгадай слово” на супервузьких екранах і прибрано дубльований знак питання у кнопці правил.
- У setup “Вгадай слово” одночасно відкривається лише один компактний dropdown.
- Збільшено адаптивний масштаб тексту в раунді Alias.
- Виправлено класифікацію іменників у `words.json`: предмети прибрано з теми “Дії”.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.3`.

## 0.5.2
- Поліровано головне меню: явні breakpoint-и для mobile, tablet і desktop без схеми 3+1, активні ігри завжди окремо від блоку “Незабаром”.
- Очищено картки режимів, PNG-емблеми й палітри у світлій та темній темах.
- Додано компактні кнопки правил у setup-екрани Alias, Крокодила, “Вгадай слово” і “Хто я?”.
- Зменшено перевантаження налаштувань “Хто я?”: категорії згорнуті в summary з акуратною сіткою вибору.
- Перекомпоновано раунд і фінал “Хто я?”, додано стабільне відкриття spoiler ролі на desktop, touch і клавіатурі.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.2`.

## 0.5.1
- Виправлено концепцію видимості ролей у режимі “Хто я?”: сам гравець не бачить роль, а ведучий або інші учасники керують підказками.
- Додано тимчасові спойлери ролей з автохованням і модальне вікно “Учасники”.
- Перейменовано формат “Передай телефон” на “Телефон у ведучого”.
- Перебудовано головне меню під 4 активні режими без схеми 3+1.
- Підключено PNG-емблеми з `assets/game-icons/`, включно з `whoami.png`.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.1`.

## 0.5.0
- Додано повноцінний режим “Хто я?” з форматами “Передай телефон” і “Телефон на лобі”.
- Додано типи партії “По черзі”, “Одна роль” і “На час”, включно з командним режимом для раундів на час.
- Додано словник `whoami.json` з 12 категоріями ролей і рівнями складності.
- Оновлено PWA-кеш, `version.json`, cache-busting у HTML та версію інтерфейсу до `0.5.0`.


## 0.4.39
- Виправлено повторне відкриття плашки “ПОТРІБНО ОНОВИТИ”, коли локальна і серверна версії вже однакові.
- Виправлено повернення “У меню” після завершення або повторного старту режиму “Вгадай слово”.
- Підказки у “Вгадай слово” зроблено помітнішими, а кнопку правил вирівняно по центру кружечка.
- Додано додаткову адаптацію поля “Вгадай слово” до висоти екрана, щоб клавіатура, “Ввести” і Backspace краще поміщалися на iPhone/Safari.

Мовограй — статична українська веб-гра для компанії. У грі є режими “Поясни слово (Alias)”, “Покажи слово (Крокодил)”, “Вгадай слово” і “Хто я?”: можна пояснювати слова, показувати завдання жестами, відгадувати слова або грати в ролі з питаннями “так/ні”.

## Локальний запуск

1. Відкрийте проєкт у VS Code.
2. Встановіть розширення Live Server, якщо воно ще не встановлене.
3. Натисніть правою кнопкою на `index.html`.
4. Оберіть `Open with Live Server`.

Важливо запускати через локальний сервер, а не просто відкривати файл напряму, бо гра завантажує словники з JSON-файлів.

## Основні файли

- `index.html` — структура екранів гри.
- `styles.css` — оформлення, адаптивність і кольорові режими.
- `app.js` — логіка режимів, команд, таймера, свайпів і переможця.
- `manifest.webmanifest` — налаштування PWA / запуску з початкового екрана.
- `service-worker.js` — кешування основних файлів для PWA.
- `words.json` — словник для “Поясни слово (Alias)”.
- `crocodile.json` — завдання для “Покажи слово (Крокодил)”.
- `wordguess.json` — основний український словник “Вгадай слово”.
- `wordguess-ru.json` / `wordguess-en.json` — приховані тестові Labs-словники RU/EN.

## Редагування словників

Слова для Alias редагуються у `words.json`.

Завдання для Крокодила редагуються у `crocodile.json`. Для Крокодила елементи мають формат:

```json
{ "text": "кіт", "kind": "noun" }
```

Підтримувані типи: `noun`, `action`, `phrase`.

## GitHub Pages

Проєкт статичний і може працювати на GitHub Pages без збірки, Node.js або npm.

Рекомендовані налаштування GitHub Pages:

- Branch: `main` або поточна публічна гілка.
- Folder: `/root`.

Після публікації перевірте, що відкриваються:

- `index.html`
- `styles.css`
- `app.js`
- `words.json`
- `crocodile.json`
- `wordguess.json`
- `whoami.json`
- `manifest.webmanifest`
- `service-worker.js`

## Режим “Хто я?”

Ролі зберігаються у `whoami.json`. Структура:

```json
{
  "version": "1.0",
  "categories": {
    "Тварини": {
      "easy": [],
      "medium": [],
      "hard": []
    }
  }
}
```

Формат “Передай телефон” спершу роздає приховані ролі гравцям. Формат “Телефон на лобі” показує роль великим текстом на екрані. У типі “На час” можна грати без команд або з 2-4 командами.


## Додавання на початковий екран iPhone

Щоб гра відкривалася як окремий застосунок без панелей Safari:

1. Відкрийте сайт саме в Safari.
2. Натисніть кнопку “Поділитися”.
3. Оберіть “На початковий екран”.
4. Підтвердьте додавання.
5. Запускайте гру з іконки на початковому екрані.

Якщо іконка була додана раніше, її потрібно видалити й додати сайт заново, бо iOS може не підтягнути нові PWA-налаштування для старого ярлика.

У режимі запуску з початкового екрана Safari-панелі мають зникнути. Системний рядок стану iOS зверху може лишатися — це нормально.

## Оновлення PWA

У проєкті є `version.json`. Під час запуску сайт без кешування порівнює локальну version/build revision з опублікованою. Лише новіша revision з `required: true` відкриває блокувальне вікно **“ПОТРІБНО ОНОВИТИ”**. Для `required: false` гра не блокується: один раз показується коротке повідомлення, а новий service worker може природно застосуватися після наступного відкриття.

Кнопка обов'язкового оновлення перевіряє реєстрацію лише в поточному scope, просить waiting worker активуватися і перезавантажує сторінку після зміни controller. Код застосунку не очищає кеші та не відключає service worker; старі `movohray-cache-*` видаляє новий worker під час власної activation.

## 0.4.39

Стиснуто верхню панель режиму “Вгадай слово” для iPhone/PWA: дві підказки тепер показуються як компактні лампочки з номерами 1/2, а кнопка правил не переноситься вниз. Друга підказка помітно неактивна до відкриття першої і підсвічується після її активації. Додано додаткові компактні стилі для вузьких і невисоких екранів, щоб поле, клавіатура і кнопка введення краще поміщалися на екран.


## 0.4.39
- Додано режими Вгадай слово на 5/6/7 літер.
- Додано третю підказку та посилено перевірку оновлень PWA.

## 0.4.39
- Посилено перевірку актуальної версії PWA через `version.json` без кешування.
- У режимі “Вгадай слово” додано вибір 5/6/7 літер перед стартом.
- Додано третій рівень підказки: підсвічення всіх літер загаданого слова на клавіатурі.
- `wordguess.json` переведено на структуру `modes` для різної довжини слів.

### 0.4.39
- Відновлено запуск меню на iOS 12: прибрано синтаксис JavaScript, який старий Safari не може навіть розібрати.
- Додано запасний flex-layout для першого iPad Air та інших старих WebKit.
- Емодзі режимів замінено на виразні прозорі SVG-емблеми, які однаково працюють у світлій і темній темах.


## 0.4.39
- Додано підсумок використаних підказок і поширення результату «Вгадай слово».
- Клавіатуру наближено до iPhone: більші клавіші, зміщені ряди, виразні натискання.
- У словах для загадування залишено переважно чіткі іменники; дієслова прибрано.
- З Alias прибрано дієслівні завдання; у Крокодилі залишено іменники та прибрано тему «Дії».
- До майбутніх режимів додано «Світлограй».
- Прибрано Alias: 590 дієслівних завдань; Крокодил: 928 неіменникових завдань.


## 0.4.39
- Оновлено прозорі емблеми режимів: діалоги для Alias, крокодильчик для Крокодила, сітка 5×5 для Вгадай слово.
- Кнопку поширення результату зроблено компактною поруч із загаданим словом.


### 0.6.4a

- Removed `тройка` from the RU 6-letter target/accepted pool.
- Reworked Achievements collection for iPhone performance: only one category is rendered at a time instead of duplicating all achievement cards in Settings and the modal.
- Removed expensive modal backdrop blur and card filters on the Achievements scroller.
- Fixed the Achievements close control so it stays inside a safe-area-aware, non-scrolling modal header.
- Labs now shows a lightweight achievements summary and opens the same optimized collection.

## 0.6.4b
- Оптимізовано колекцію досягнень: категорії, пошук, адаптивна навігація, продуктивніший рендер і безпечна геометрія плиток.
- Досягнення отримали бейджі ігор; додано перші нагороди для Alias і Крокодила та секретні локальні меми Word Guess.
- Секретні умови відкриваються в окремому popup; отримана секретна нагорода більше не приховує власну умову.
- Масові відкриття нагород об’єднано у довше святкування з перегортанням вибраних ачівок і звуковими ефектами.
- Виконані нагороди мають виразний золотистий стан усієї картки; стан отримано/закрито показується галочкою або замком під іконкою.
- Перероблено компактний блок підказок Word Guess і полегшено кнопку налаштувань на мобільних екранах.
- RU Word Guess сприймає Е/Ё як еквівалентні для введення та перевірки, зберігаючи правильне написання цільового слова.
- Розширено UA/RU/EN словники курованими словами; слова-національності прибрано з RU target-пулу, але збережено серед допустимих введень.
- Розширено локалізацію інтерфейсу UA/RU/EN, включно з меню, налаштуваннями, підказками, досягненнями й popup-елементами.

## 0.6.4c
- Додано inbox-модель досягнень: нові нагороди позначаються як «Нове» до фактичного перегляду.
- Додано категорію «Нові»; масовий toast відкриває саме її для пакетного перегляду.
- У розділі «Всі» непроглянуті нагороди автоматично сортуються першими, найсвіжіші — вище.
- На отриманих нагородах показується локальна дата й час отримання.
- Старі нагороди при оновленні не стають штучно «новими»: schema v5 мігрує їх як уже переглянуті.
- Біля кнопки 🏆 з’являється окремий лічильник непроглянутих нагород.

### 0.6.5 candidate-2

- Achievements navigation now starts with a game-level filter, then category tags.
- Unread achievement counters are gold, shown only when non-zero, and disappear immediately after viewing.
- Global “New” inbox combines unread achievements from every game.
- Added substantial Alias, Charades, and Who Am I achievement sets with persistent counters.


- Candidate-2 expands Alias, Charades, and Who Am I to 75 achievements each, with per-round skill/chaos/secrets, difficulty/time/team challenges, persistent milestones, and real streak tracking. The full collection now contains 390 achievements.

### 0.6.5 candidate-3

- Expanded the party-game achievement pool again, with the largest new set focused on Alias: fast word solves, topic streaks, long/short word challenges, timed round feats, and local easter eggs.
- Added a private cat-themed easter egg while keeping normal animal words in the party-game pools.
- Added four private sticker assets for the cat-themed easter egg in Alias and Charades.
- Added a playful capybara sticker reaction for “капібара”.
- Added hidden cat/capybara easter-egg tracking plus persistent counters for repeat discoveries.
- Achievement storage schema is now v8 and remains forward-compatible with existing 0.6.4c/0.6.5 test progress.

### 0.6.5 candidate-4
- Reframed the private memorial reference as a quiet easter egg rather than an achievement theme.
- Added a private manual Word Guess easter-egg input that is never selected as a target.
- Added session exposure weighting across Alias, Charades, Word Guess, and Who Am I so already shown content loses priority until less-seen content catches up.
- Expanded the Alias vocabulary with hundreds of curated Ukrainian nouns and broadened Crocodile noun prompts with actable concrete nouns.
- Pruned arbitrary exact-score achievements and low-value one-off easter-egg achievements, keeping the stronger skill, streak, pattern, and discovery set.

### 0.6.5 candidate-5
- Alias: progressive final-15-second timer urgency with subtle visual pulse and escalating timer ticks.
- The warning remains confined to the timer so it does not cover the word card or actions.

### 0.6.5 candidate-6
- Removed stale localization strings for retired one-off capybara achievements so the Achievements catalogue no longer carries dead conditions.
- Strengthened session content ranking for Alias, Charades, Who Am I, and Word Guess: exposure count remains the primary penalty and a recency penalty now pushes just-shown content farther back after deck rebuilds.
- The ranking still guarantees unseen content outranks seen content while any unseen items remain, and duplicate normalized words stay deduplicated inside party-game pools.



### 0.6.5 candidate-7
- Added a quiet hidden RU Word Guess easter egg: secret manual guesses are accepted but never selected as targets.
- Added four hidden sticker reactions for that Word Guess easter egg.
- Preserved the existing private memorial easter egg and the stronger in-session anti-repeat word weighting.

### 0.6.5 candidate-8

- Alias: during the final 7 seconds, a large non-blocking countdown focus appears in the free upper viewport area.
- The countdown grows every second and becomes strongest at 3–1 seconds while preserving the word card and controls.
- Existing progressive 15-second sound/timer urgency remains active.

### 0.6.5 candidate-10

- Alias card handoff layering fix: outgoing card flies behind the new opaque card, so the previous word never covers the next one during swipe/button transitions.

- Alias card handoff no longer snaps the outgoing word back to center after a swipe.
- The outgoing physical card is frozen into a temporary visual ghost and continues its flight.
- The next word is selected immediately and enters from the opposite direction during the same animation.
- The same handoff is used for button actions and single-card next-card gestures.

### 0.6.5 candidate-12

- Replaced the overlapping Alias ghost/incoming-card transition with a single-card two-phase handoff.
- The old word completes its exit first; only while the card is already invisible/outside is the content swapped.
- The same physical card then enters from the opposite side, eliminating old/new animation conflicts entirely.
- Swipe drag position is preserved into the exit, so the old card never snaps back to center.


### 0.6.5 candidate-12
- Alias round review now uses full-width rows and wraps complete words/phrases instead of clipping them inside compact tiles.
- Correct / skip / wrong feedback now layers short randomized musical accents over the existing sounds so repeated actions feel less mechanical without becoming loud.
- Word Guess accepted attempts receive a small context-sensitive audio cue based on how many letters matched; invalid attempts use the richer wrong feedback.

### 0.6.5 candidate-13
- Alias round review is a responsive multi-column tile table again.
- Words and metadata are never ellipsized; long entries wrap and expand their tile vertically.
- Compact landscape layout keeps the denser grid while preserving full word visibility.

### 0.6.5 candidate-14
- Strengthened session anti-repeat ordering: exposure count is now an absolute tier, then least-recently shown content wins within that tier; small random recency buckets avoid deterministic second-pass order.
- Expanded Alias-friendly single-word pools so every category has at least 60 unique easy+medium entries when phrases are disabled, reducing forced repeats in category-only games.
- Renamed the visible 100-guessed Who Am I achievement so a hidden Word Guess easter egg is not hinted at by the achievements screen.
- Kept the private cat reaction available for regular cat words; its deeper memorial variant remains reachable only through the secret trigger.
- Removed private easter-egg names from normal Alias, Charades, Who Am I, and Word Guess target dictionaries while keeping the secret manual Word Guess guesses functional.
- Version checks now compare the candidate number too, so c15 can be detected after c14 even when both are built on the same date.



### 0.6.5 candidate-15
- Removed the public “Coming soon” block from the main game-mode screen and moved future-mode information into the settings menu.
- The hidden Labs section can now be concealed and revealed again with the same seven-tap version gesture, without resetting unlocked languages, achievements, or progress.
- Labs visibility is stored separately from Labs unlock state, so hiding the secret menu stays hidden after reopening the app until the gesture is repeated.
