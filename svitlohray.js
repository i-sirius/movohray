/* Native Movohray adapter; no independent registration, manifest or audio assets. */
var Svitlohray = (function () {
  "use strict";
  var E = SvitlohrayEngine;
  var locales = {
    uk: { bonus: "Бонусні ігри", title: "Світлограй", description: "Зроби всі клітинки одного кольору", rules: "Натисни клітинку, щоб змінити її колір і колір сусідів згори, знизу, зліва та справа.", easy: "Легко", normal: "Середньо", hard: "Складно", size: "Розмір / складність", moves: "Ходи", time: "Час", newGame: "Нова гра", hint: "Показати хід", hinted: "Натисни клітинку із зіркою", colors: "Кольори поля", on: "Увімкнено", off: "Вимкнено", reset: "Початкові кольори", random: "Інші кольори", contrast: "Ці кольори надто схожі. Спробуй інші.", win: "Готово!", replay: "Ще раз", other: "Змінити поле", menu: "У меню", back: "До бонусних ігор", best: "Особисті рекорди (без підказок)", cell: "Клітинка", paused: "Пауза", ready: "Час почнеться з першого ходу", playing: "Зроби всі клітинки одного кольору", assisted: "Використано підказку" },
    ru: { bonus: "Бонусные игры", title: "Цветоигра", description: "Сделай все клетки одного цвета", rules: "Нажми клетку: цвет изменится у неё и у соседей сверху, снизу, слева и справа.", easy: "Легко", normal: "Средне", hard: "Сложно", size: "Размер / сложность", moves: "Ходы", time: "Время", newGame: "Новая игра", hint: "Показать ход", hinted: "Нажми клетку со звездой", colors: "Цвета поля", on: "Включено", off: "Выключено", reset: "Исходные цвета", random: "Другие цвета", contrast: "Цвета слишком похожи. Попробуй другие.", win: "Готово!", replay: "Ещё раз", other: "Изменить поле", menu: "В меню", back: "К бонусным играм", best: "Личные рекорды (без подсказок)", cell: "Клетка", paused: "Пауза", ready: "Время начнётся с первого хода", playing: "Сделай все клетки одного цвета", assisted: "Использована подсказка" },
    en: { bonus: "Bonus games", title: "Lightplay", description: "Make every tile the same color", rules: "Tap a tile to change its color and the colors directly above, below, left and right.", easy: "Easy", normal: "Medium", hard: "Hard", size: "Size / difficulty", moves: "Moves", time: "Time", newGame: "New game", hint: "Show a move", hinted: "Tap the tile with the star", colors: "Board colors", on: "On", off: "Off", reset: "Default colors", random: "New colors", contrast: "These colors look too similar. Try another pair.", win: "Solved!", replay: "Play again", other: "Change board", menu: "Main menu", back: "Back to bonus games", best: "Personal bests (without hints)", cell: "Tile", paused: "Paused", ready: "Time starts with your first move", playing: "Make every tile the same color", assisted: "Hint used" }
  };
  var board, moves = 0, elapsed = 0, last = null, interval = null, started = false, finished = false, assisted = false, recommended = null;
  var gameId = "", manualPaletteChanged = false, randomPaletteUsed = false;
  var size = 0, colors = ["#287b78", "#fff1cc"], defaults = colors.slice(), best = {};
  function text(key) { return (locales[selectedWordGuessLanguage] || locales.uk)[key]; }
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem("movohray-svitlohray-" + key)) || fallback; } catch (_) { return fallback; } }
  function save(key, value) { try { localStorage.setItem("movohray-svitlohray-" + key, JSON.stringify(value)); } catch (_) { /* In-memory fallback. */ } }
  function luminance(hex) { return hex.slice(1).match(/../g).map(function (v) { v = parseInt(v, 16) / 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (sum, v, i) { return sum + v * [.2126, .7152, .0722][i]; }, 0); }
  function validColors(pair) { if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(function (v) { return typeof v === "string" && /^#[\da-f]{6}$/i.test(v); })) return false; var a = luminance(pair[0]), b = luminance(pair[1]); return (Math.max(a,b) + .05) / (Math.min(a,b) + .05) >= 3; }
  function el(tag, cls, value, parent) { var n = document.createElement(tag); n.className = cls || ""; if (value !== undefined) n.textContent = value; if (parent) parent.appendChild(n); return n; }
  function button(parent, key, action, id, primary) { var b = el("button", primary ? "primary-btn" : "secondary-btn", text(key), parent); b.type = "button"; if (id) b.id = id; b.onclick = action; return b; }
  function root() { var screen = document.getElementById("svitlohrayScreen"); screen.textContent = ""; return el("div", "card bubble-card svitlohray-card", undefined, screen); }
  function heading(box, value) { var h = el("h1", "", value, box); h.tabIndex = -1; h.focus({preventScroll:true}); }
  function format(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2,"0"); }
  function sizeName() { return E.sizes[size].join(" × ") + " · " + text(["easy","normal","hard"][size]); }
  function suspended() { return document.hidden || getCurrentAppScreenName() !== "svitlohray" || document.body.classList.contains("app-settings-open") || document.body.classList.contains("required-update-open"); }
  function tick() { var now = performance.now(); if (last !== null) elapsed += now - last; last = started && !finished && !suspended() ? now : null; var t = document.getElementById("svitlohrayTime"); if (t) t.textContent = format(elapsed); }
  function open() { closeAppSettings(); var saved = read("colors", defaults); colors = validColors(saved) ? saved : defaults.slice(); best = read("bests", {}); if (!best || typeof best !== "object" || Array.isArray(best)) best = {}; showScreen("svitlohray"); newGame(); }
  function newGame() { clearInterval(interval); board = E.generate.apply(null, E.sizes[size]); gameId = String(Date.now()) + "-" + Math.random().toString(36).slice(2); manualPaletteChanged = false; randomPaletteUsed = false; moves = 0; elapsed = 0; last = null; started = false; finished = false; assisted = false; recommended = null; render(); interval = setInterval(tick, 200); playGameSound("roundStart"); }
  function leave(toMenu) { tick(); showScreen("menu", {historyMode:"replace"}); if (!toMenu) { openAppSettings(); document.getElementById("svitlohrayOpen").focus(); } }
  function palette(pair, source) { var message = document.getElementById("svitlohrayPaletteMessage"); if (!validColors(pair)) { message.textContent = text("contrast"); } else { if (pair.join() !== colors.join()) { if (source === "manual") manualPaletteChanged = true; if (source === "random") randomPaletteUsed = true; } colors = pair.slice(); save("colors", colors); message.textContent = ""; paint(); } document.getElementById("svitlohrayOn").value = colors[0]; document.getElementById("svitlohrayOff").value = colors[1]; }
  function paint() { document.querySelectorAll(".svitlohray-tile").forEach(function (b, i) { b.style.backgroundColor = colors[board.cells[i] ? 0 : 1]; b.setAttribute("aria-pressed", String(Boolean(board.cells[i]))); b.setAttribute("aria-label", text("cell") + " " + (Math.floor(i / board.cols)+1) + ", " + (i % board.cols+1) + ": " + text(board.cells[i] ? "on" : "off") + (i === recommended ? ". " + text("hinted") : "")); b.classList.toggle("is-hint", i === recommended); b.textContent = i === recommended ? "★" : ""; }); }
  function move(index) { if (finished || suspended()) return; tick(); started = true; last = performance.now(); board = E.toggle(board,index); moves++; recommended = null; paint(); document.getElementById("svitlohrayMoves").textContent = moves; document.getElementById("svitlohrayStatus").textContent = text("playing"); if (E.won(board)) win(); }
  function hint() { if (finished) return; recommended = E.hint(board); assisted = true; paint(); document.getElementById("svitlohrayStatus").textContent = text("hinted"); playGameSound("reveal"); }
  function render() {
    var box = root(); button(box,"back",function(){leave(false);},"svitlohrayBack"); heading(box,text("title"));
    el("p","svitlohray-copy",text("rules"),box);
    var label = el("label","svitlohray-size",text("size"),box), select = el("select","",undefined,label); select.id = "svitlohraySize";
    E.sizes.forEach(function(s,i){ var o = el("option","",s.join(" × ") + " · " + text(["easy","normal","hard"][i]),select); o.value = i; }); select.value = size; select.onchange = function(){size = Number(select.value); newGame(); document.getElementById("svitlohraySize").focus();};
    var hud = el("div","svitlohray-hud",undefined,box);
    [["moves","svitlohrayMoves",moves],["time","svitlohrayTime",format(elapsed)]].forEach(function(a){var p=el("div","",text(a[0]),hud); el("strong","",a[2],p).id=a[1];});
    var grid = el("div","svitlohray-grid",undefined,box); grid.style.gridTemplateColumns = "repeat("+board.cols+", minmax(0,1fr))"; grid.setAttribute("role","group"); grid.setAttribute("aria-label",text("title")+" "+sizeName());
    board.cells.forEach(function(_,i){ var b=el("button","svitlohray-tile","",grid); b.type="button"; b.onclick=function(){move(i);}; }); paint();
    var status = el("p","svitlohray-status",text(started ? "playing" : "ready"),box); status.id="svitlohrayStatus"; status.setAttribute("role","status");
    var actions=el("div","svitlohray-actions",undefined,box); button(actions,"hint",hint,"svitlohrayHint"); button(actions,"newGame",newGame,"svitlohrayNew",true);
    var details=el("details","svitlohray-colors",undefined,box); el("summary","",text("colors"),details);
    var inputs=el("div","svitlohray-actions",undefined,details);
    ["on","off"].forEach(function(key,i){var l=el("label","",text(key),inputs), input=el("input","",undefined,l); input.type="color"; input.id=i ? "svitlohrayOff":"svitlohrayOn"; input.value=colors[i]; input.onchange=function(){var pair=colors.slice();pair[i]=input.value;palette(pair, "manual");};});
    var tools=el("div","svitlohray-actions",undefined,details); button(tools,"reset",function(){palette(defaults);},"svitlohrayReset"); button(tools,"random",function(){var choices=[["#613c83","#ffe5a3"],["#174f88","#bdf4ec"],["#8a304e","#ffdfab"],["#315b39","#f9dfed"]].filter(function(p){return p.join()!==colors.join();}); palette(choices[Math.floor(Math.random()*choices.length)], "random");},"svitlohrayRandom");
    el("p","svitlohray-copy","",details).id="svitlohrayPaletteMessage"; document.getElementById("svitlohrayPaletteMessage").setAttribute("role","status");
    showBest(box);
  }
  function showBest(box) { var b=best[E.sizes[size].join("x")]; if (b && Number.isFinite(b.moves) && b.moves>0 && Number.isFinite(b.time) && b.time>=0) el("p","svitlohray-copy",text("best")+" · "+text("moves")+": "+b.moves+" · "+text("time")+": "+format(b.time),box); }
  function win() { tick(); finished=true; last=null; clearInterval(interval); var key=E.sizes[size].join("x"), previous=best[key] || {}; if (!assisted) { best[key]={moves:Math.min(moves,Number.isFinite(previous.moves) && previous.moves>0 ? previous.moves:Infinity),time:Math.min(elapsed,Number.isFinite(previous.time) && previous.time>=0 ? previous.time:Infinity)}; save("bests",best); }
    NewModeAchievements.recordSvitlohray(snapshot());
    renderFinal(); playGameCompleteSound("win"); }
  function renderFinal() { var box=root(); heading(box,text("win")); el("p","svitlohray-copy",sizeName(),box); el("p","svitlohray-result",text("moves")+": "+moves+" · "+text("time")+": "+format(elapsed),box); if(assisted) el("p","svitlohray-copy",text("assisted"),box); showBest(box); button(box,"replay",newGame,"svitlohrayReplay",true); button(box,"other",function(){newGame(); document.getElementById("svitlohraySize").focus();},"svitlohrayOther"); button(box,"menu",function(){leave(true);},"svitlohrayMenu"); }
  function localize() { var section=document.getElementById("appBonusGamesSection"); section.textContent=""; el("h3","app-settings-section-title",text("bonus"),section); var b=button(section,"title",open,"svitlohrayOpen"); b.classList.add("svitlohray-entry"); el("span","",text("description"),b); if (getCurrentAppScreenName()==="svitlohray" && board) { if(finished) renderFinal(); else render(); } }
  function snapshot() { return {gameId:gameId,board:board ? E.deserialize(E.serialize(board)):null,moves:moves,elapsed:elapsed,finished:finished,assisted:assisted,manualPaletteChanged:manualPaletteChanged,randomPaletteUsed:randomPaletteUsed}; }
  document.addEventListener("visibilitychange",tick);
  new MutationObserver(function(){ if(board) tick(); }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  return { open:open, localize:localize, locales:locales, validColors:validColors,
    onScreen:function(screen){ if(screen!=="svitlohray"){tick();clearInterval(interval);last=null;} document.getElementById("svitlohrayScreen").classList.toggle("active",screen==="svitlohray"); },
    back:function(options){if(getCurrentAppScreenName()!=="svitlohray")return false;leave(Boolean(options && options.destination==="menu"));return true;},
    snapshot:snapshot
  };
}());
