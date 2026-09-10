const WORDS = [
  { id: "curious", word: "curious", pronunciation: "/ˈkjʊəriəs/", translation: "любопытный", example: "She was curious about the new place.", topic: "mind" },
  { id: "notice", word: "notice", pronunciation: "/ˈnəʊtɪs/", translation: "замечать", example: "Did you notice anything different?", topic: "mind" },
  { id: "improve", word: "improve", pronunciation: "/ɪmˈpruːv/", translation: "улучшать", example: "Reading will improve your vocabulary.", topic: "mind" },
  { id: "choose", word: "choose", pronunciation: "/tʃuːz/", translation: "выбирать", example: "You can choose any seat.", topic: "mind" },
  { id: "remember", word: "remember", pronunciation: "/rɪˈmembə/", translation: "помнить", example: "Remember to call me tonight.", topic: "mind" },
  { id: "instead", word: "instead", pronunciation: "/ɪnˈsted/", translation: "вместо этого", example: "Let's walk instead of taking a taxi.", topic: "mind" },

  { id: "platform", word: "platform", pronunciation: "/ˈplætfɔːm/", translation: "платформа", example: "The train leaves from platform six.", topic: "travel" },
  { id: "journey", word: "journey", pronunciation: "/ˈdʒɜːni/", translation: "путешествие", example: "The journey took three hours.", topic: "travel" },
  { id: "delayed", word: "delayed", pronunciation: "/dɪˈleɪd/", translation: "задержанный", example: "Our flight has been delayed.", topic: "travel" },
  { id: "luggage", word: "luggage", pronunciation: "/ˈlʌɡɪdʒ/", translation: "багаж", example: "Where can I leave my luggage?", topic: "travel" },
  { id: "abroad", word: "abroad", pronunciation: "/əˈbrɔːd/", translation: "за границей", example: "She has never lived abroad.", topic: "travel" },
  { id: "route", word: "route", pronunciation: "/ruːt/", translation: "маршрут", example: "This is the quickest route home.", topic: "travel" },

  { id: "reliable", word: "reliable", pronunciation: "/rɪˈlaɪəbl/", translation: "надёжный", example: "He is a reliable colleague.", topic: "daily" },
  { id: "crowded", word: "crowded", pronunciation: "/ˈkraʊdɪd/", translation: "переполненный", example: "The café was very crowded.", topic: "daily" },
  { id: "afford", word: "afford", pronunciation: "/əˈfɔːd/", translation: "позволить себе", example: "I can't afford a new laptop yet.", topic: "daily" },
  { id: "borrow", word: "borrow", pronunciation: "/ˈbɒrəʊ/", translation: "одолжить, взять", example: "Can I borrow your pen?", topic: "daily" },
  { id: "available", word: "available", pronunciation: "/əˈveɪləbl/", translation: "доступный", example: "Is this table available?", topic: "daily" },
  { id: "nearly", word: "nearly", pronunciation: "/ˈnɪəli/", translation: "почти", example: "It is nearly six o'clock.", topic: "daily" },

  { id: "confident", word: "confident", pronunciation: "/ˈkɒnfɪdənt/", translation: "уверенный", example: "I feel more confident when I practise.", topic: "feelings" },
  { id: "relieved", word: "relieved", pronunciation: "/rɪˈliːvd/", translation: "испытавший облегчение", example: "She felt relieved after the exam.", topic: "feelings" },
  { id: "proud", word: "proud", pronunciation: "/praʊd/", translation: "гордый", example: "You should be proud of your progress.", topic: "feelings" },
  { id: "nervous", word: "nervous", pronunciation: "/ˈnɜːvəs/", translation: "нервничающий", example: "He was nervous before the interview.", topic: "feelings" },
  { id: "exhausted", word: "exhausted", pronunciation: "/ɪɡˈzɔːstɪd/", translation: "измученный", example: "I was exhausted after the trip.", topic: "feelings" },
  { id: "grateful", word: "grateful", pronunciation: "/ˈɡreɪtfl/", translation: "благодарный", example: "I'm grateful for your help.", topic: "feelings" }
];

const TOPICS = [
  { id: "mind", title: "Мысли и решения", description: "Говорим о выборе, идеях и развитии", symbol: "?", color: "#5b43f1", soft: "#e9e5ff" },
  { id: "travel", title: "Путешествия", description: "Поезда, аэропорты и новые маршруты", symbol: "→", color: "#ff6b57", soft: "#ffded8" },
  { id: "daily", title: "Каждый день", description: "Полезные слова для обычных ситуаций", symbol: "+", color: "#e0b52c", soft: "#fff0b4" },
  { id: "feelings", title: "Чувства", description: "Точно описываем настроение и эмоции", symbol: "~", color: "#27aab6", soft: "#d3f6f8" }
];

const STORAGE_KEY = "bridge-english-progress-v1";
const INTERVALS = [0, 1, 3, 7, 14, 30];
const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const state = loadState();
let currentView = "today";
let currentSession = null;
let toastTimer = null;

function localDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function createDefaultState() {
  return { version: 1, xp: 0, words: {}, activity: {}, quickDoneAt: null };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || parsed.version !== 1) return createDefaultState();
    return { ...createDefaultState(), ...parsed, words: parsed.words || {}, activity: parsed.activity || {} };
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getWordProgress(id) {
  return state.words[id] || { box: 0, seen: 0, correct: 0, attempts: 0, due: localDateKey() };
}

function dueWords() {
  const today = localDateKey();
  return WORDS.filter(word => {
    const progress = state.words[word.id];
    return progress && progress.seen > 0 && progress.due <= today;
  });
}

function learnedWords() {
  return WORDS.filter(word => (state.words[word.id]?.seen || 0) > 0);
}

function masteredWords() {
  return WORDS.filter(word => (state.words[word.id]?.box || 0) >= 4);
}

function recordActivity(xp, correct = 0, total = 0) {
  const key = localDateKey();
  const today = state.activity[key] || { xp: 0, correct: 0, total: 0 };
  today.xp += xp;
  today.correct += correct;
  today.total += total;
  state.activity[key] = today;
}

function recentDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const offset = index - (count - 1);
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const key = localDateKey(date);
    return { key, date, data: state.activity[key] || { xp: 0, correct: 0, total: 0 } };
  });
}

function calculateStreak() {
  const active = new Set(Object.entries(state.activity).filter(([, value]) => value.xp > 0).map(([key]) => key));
  if (!active.size) return 0;
  let cursor = new Date();
  if (!active.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function pluralDays(number) {
  const lastTwo = number % 100;
  const last = number % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function renderAll() {
  const due = dueWords();
  const streak = calculateStreak();
  const learned = learnedWords();
  const mastered = masteredWords();
  const activity = Object.values(state.activity);
  const totalAttempts = activity.reduce((sum, day) => sum + day.total, 0);
  const totalCorrect = activity.reduce((sum, day) => sum + day.correct, 0);
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  document.querySelector("#header-xp").textContent = state.xp;
  document.querySelector("#header-streak").textContent = streak;
  document.querySelector("#sidebar-streak").textContent = `${streak} ${pluralDays(streak)}`;
  document.querySelector("#review-nav-count").textContent = due.length;
  document.querySelector("#mission-review-count").textContent = `${due.length} на повторение`;
  document.querySelector("#review-hero-count").textContent = due.length;

  const todayXp = state.activity[localDateKey()]?.xp || 0;
  const dailyPercent = Math.min(100, Math.round((todayXp / 80) * 100));
  document.querySelector("#daily-percent").textContent = `${dailyPercent}%`;
  document.querySelector("#daily-progress-ring").style.setProperty("--progress", `${dailyPercent * 3.6}deg`);
  document.querySelector("#mission-title").innerHTML = dailyPercent >= 100 ? "Дневная цель<br>выполнена!" : "Сделай английский<br>частью своего дня.";
  document.querySelector("#mission-description").textContent = dailyPercent >= 100 ? "Отличный круг! Можно продолжить или вернуться завтра." : "Новые слова, короткое повторение и один бодрый спринт.";
  document.querySelector("#start-daily").firstChild.textContent = dailyPercent >= 100 ? " Ещё один раунд " : " Начать занятие ";

  renderWeek();
  renderTopics();
  renderReviewList(due);
  renderProgress(learned, mastered, accuracy, streak);
}

function renderWeek() {
  const days = recentDays();
  const total = days.reduce((sum, day) => sum + day.data.xp, 0);
  document.querySelector("#week-xp").textContent = `${total} XP`;
  document.querySelector("#rhythm-message").textContent = total ? "Так держать: регулярность важнее длинных занятий." : "Первое занятие начнёт твою серию.";
  document.querySelector("#week-strip").innerHTML = days.map(day => `
    <div class="week-day ${day.data.xp ? "is-done" : ""} ${day.key === localDateKey() ? "is-today" : ""}">
      <span>${day.data.xp ? "✓" : day.date.getDate()}</span>
      <small>${dayNames[day.date.getDay()]}</small>
    </div>
  `).join("");
}

function topicProgress(topicId) {
  const topicWords = WORDS.filter(word => word.topic === topicId);
  const known = topicWords.filter(word => (state.words[word.id]?.seen || 0) > 0).length;
  return { known, total: topicWords.length, percent: Math.round((known / topicWords.length) * 100) };
}

function topicCard(topic, index, detailed = false) {
  const progress = topicProgress(topic.id);
  const status = progress.percent === 100 ? "Пройдено" : progress.percent > 0 ? `${progress.percent}%` : "Новая";
  return `
    <button class="topic-card" type="button" data-topic="${topic.id}" data-symbol="${topic.symbol}" style="--topic:${topic.color};--topic-soft:${topic.soft}">
      <span class="topic-top"><span class="topic-number">УРОК ${String(index + 1).padStart(2, "0")}</span><span class="topic-status">${status}</span></span>
      <h3>${topic.title}</h3>
      <p>${topic.description}</p>
      <div class="topic-progress" aria-label="Пройдено ${progress.percent}%"><span style="width:${progress.percent}%"></span></div>
      ${detailed ? `<div class="lesson-meta"><span>${progress.total} слов</span><span>≈ 6 минут</span><span>+60 XP</span></div>` : ""}
    </button>
  `;
}

function renderTopics() {
  document.querySelector("#topic-preview-grid").innerHTML = TOPICS.map((topic, index) => topicCard(topic, index)).join("");
  document.querySelector("#lesson-grid").innerHTML = TOPICS.map((topic, index) => topicCard(topic, index, true)).join("");
}

function renderReviewList(due) {
  const container = document.querySelector("#review-list");
  if (!due.length) {
    const learned = learnedWords().length;
    container.innerHTML = `<div class="empty-state"><strong>${learned ? "На сегодня всё повторено" : "Очередь пока пуста"}</strong><span>${learned ? "Можно потренировать любые знакомые слова." : "Пройди первый урок — и слова появятся здесь."}</span></div>`;
    return;
  }
  container.innerHTML = due.slice(0, 6).map(word => {
    const progress = getWordProgress(word.id);
    return `<div class="review-row"><span>${word.word.slice(0, 1).toUpperCase()}</span><p><strong>${word.word}</strong><span>${word.translation}</span></p><small>этап ${Math.min(progress.box + 1, 5)}</small></div>`;
  }).join("");
}

function renderProgress(learned, mastered, accuracy, streak) {
  document.querySelector("#metric-xp").textContent = state.xp;
  document.querySelector("#metric-streak").textContent = streak;
  document.querySelector("#metric-words").textContent = learned.length;
  document.querySelector("#metric-accuracy").textContent = `${accuracy}%`;
  document.querySelector("#level-progress-text").textContent = `${Math.round((learned.length / WORDS.length) * 100)}%`;

  const days = recentDays();
  const maxXp = Math.max(80, ...days.map(day => day.data.xp));
  const totalXp = days.reduce((sum, day) => sum + day.data.xp, 0);
  document.querySelector("#chart-total").textContent = `${totalXp} XP`;
  document.querySelector("#bar-chart").innerHTML = days.map(day => {
    const height = Math.max(3, Math.round((day.data.xp / maxXp) * 180));
    return `<div class="bar-column ${day.key === localDateKey() ? "is-today" : ""}"><span class="bar-value">${day.data.xp || ""}</span><span class="bar" style="height:${height}px"></span><small>${dayNames[day.date.getDay()]}</small></div>`;
  }).join("");

  const learningCount = learned.length - mastered.length;
  const newCount = WORDS.length - learned.length;
  const masteredDegrees = (mastered.length / WORDS.length) * 360;
  const learningDegrees = ((mastered.length + learningCount) / WORDS.length) * 360;
  document.querySelector("#vocabulary-donut").style.background = `conic-gradient(var(--violet) 0 ${masteredDegrees}deg, var(--coral) ${masteredDegrees}deg ${learningDegrees}deg, #ececf2 ${learningDegrees}deg 360deg)`;
  document.querySelector("#donut-total").textContent = learned.length;
  document.querySelector("#legend-mastered").textContent = mastered.length;
  document.querySelector("#legend-learning").textContent = learningCount;
  document.querySelector("#legend-new").textContent = newCount;

  const strongest = [...learned].sort((a, b) => {
    const first = getWordProgress(a.id);
    const second = getWordProgress(b.id);
    return (second.box * 10 + second.correct) - (first.box * 10 + first.correct);
  }).slice(0, 4);
  document.querySelector("#mastered-words").innerHTML = strongest.length
    ? strongest.map(word => `<div class="mastered-word"><strong>${word.word}</strong><span>${word.translation} · этап ${getWordProgress(word.id).box + 1}</span></div>`).join("")
    : `<div class="empty-state" style="grid-column:1/-1"><strong>Здесь появятся знакомые слова</strong><span>Начни с любого короткого урока.</span></div>`;
}

function switchView(view, updateHash = true) {
  if (!document.querySelector(`[data-view="${view}"]`)) view = "today";
  currentView = view;
  document.querySelectorAll(".view").forEach(section => section.classList.toggle("is-active", section.dataset.view === view));
  document.querySelectorAll(".nav-item").forEach(button => {
    const active = button.dataset.viewTarget === view;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
  });
  const titles = { today: getGreeting(), learn: "Уроки", review: "Повторение", progress: "Прогресс" };
  document.querySelector("#page-title").textContent = titles[view];
  document.querySelector("#today-label").textContent = view === "today" ? formatToday() : "Bridge";
  if (updateHash) history.replaceState(null, "", `#${view}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Доброй ночи!";
  if (hour < 12) return "Доброе утро!";
  if (hour < 18) return "Добрый день!";
  return "Добрый вечер!";
}

function formatToday() {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

function startTopic(topicId) {
  const words = WORDS.filter(word => word.topic === topicId);
  startSession(words, "learn");
}

function startDaily() {
  const due = dueWords();
  const unseen = WORDS.filter(word => !state.words[word.id]?.seen);
  const familiar = learnedWords();
  const selected = [...due.slice(0, 3), ...unseen.slice(0, 6)];
  const unique = [...new Map(selected.map(word => [word.id, word])).values()];
  if (unique.length < 6) unique.push(...shuffle(familiar.filter(word => !unique.some(item => item.id === word.id))).slice(0, 6 - unique.length));
  startSession(unique.slice(0, 8), unseen.length ? "learn" : "review");
}

function startReview() {
  let selected = dueWords();
  if (!selected.length) selected = shuffle(learnedWords()).slice(0, 8);
  if (!selected.length) {
    showToast("Сначала пройди любой урок");
    switchView("learn");
    return;
  }
  startSession(selected.slice(0, 10), "review");
}

function startSession(words, mode) {
  if (!words.length) return;
  currentSession = {
    words: shuffle(words),
    index: 0,
    phase: mode === "learn" ? "reveal" : "question",
    mode,
    correct: 0,
    answered: false,
    xp: 0
  };
  document.querySelector("#lesson-dialog").showModal();
  document.body.style.overflow = "hidden";
  renderSession();
}

function renderSession() {
  if (!currentSession) return;
  const { words, index, phase } = currentSession;
  const progress = ((index + (phase === "question" ? .5 : 0)) / words.length) * 100;
  document.querySelector("#session-progress-bar").style.width = `${Math.min(100, progress)}%`;
  document.querySelector("#session-xp").textContent = currentSession.xp;
  if (index >= words.length) return renderFinish();
  if (phase === "reveal") return renderReveal(words[index]);
  return renderQuestion(words[index]);
}

function renderReveal(word) {
  document.querySelector("#session-content").innerHTML = `
    <section class="exercise-card" aria-labelledby="session-title">
      <span class="exercise-kicker">Новое слово · ${currentSession.index + 1} из ${currentSession.words.length}</span>
      <h2 id="session-title">Познакомься со словом</h2>
      <p class="exercise-instruction">Прочитай пример и произнеси слово вслух.</p>
      <div class="word-reveal">
        <h3>${word.word}</h3>
        <span class="pronunciation">${word.pronunciation}</span>
        <p class="word-translation">${word.translation}</p>
        <p class="word-example">${word.example}</p>
      </div>
      <div class="exercise-actions"><button class="primary-button" type="button" data-session-action="question">Проверить себя →</button></div>
    </section>`;
}

function renderQuestion(word) {
  currentSession.answered = false;
  const useTyping = currentSession.index % 3 === 2;
  if (useTyping) {
    document.querySelector("#session-content").innerHTML = `
      <section class="exercise-card" aria-labelledby="session-title">
        <span class="exercise-kicker">Напиши слово · ${currentSession.index + 1} из ${currentSession.words.length}</span>
        <h2 id="session-title">${word.translation}</h2>
        <p class="exercise-instruction">Введи английское слово. Регистр не важен.</p>
        <form class="typing-wrap" id="typing-form">
          <input id="typing-answer" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Ответ на английском" placeholder="Твой ответ…">
          <button class="primary-button" type="submit">Проверить</button>
        </form>
        <div id="exercise-feedback" aria-live="polite"></div>
      </section>`;
    setTimeout(() => document.querySelector("#typing-answer")?.focus(), 50);
    return;
  }

  const alternatives = shuffle(WORDS.filter(item => item.id !== word.id)).slice(0, 3).map(item => item.translation);
  const choices = shuffle([word.translation, ...alternatives]);
  document.querySelector("#session-content").innerHTML = `
    <section class="exercise-card" aria-labelledby="session-title">
      <span class="exercise-kicker">Выбери перевод · ${currentSession.index + 1} из ${currentSession.words.length}</span>
      <h2 id="session-title">${word.word}</h2>
      <p class="exercise-instruction">Какой вариант подходит лучше всего?</p>
      <div class="choice-list">
        ${choices.map((choice, index) => `<button class="choice-button" type="button" data-choice="${escapeHtml(choice)}"><span>${index + 1}.</span> ${escapeHtml(choice)}</button>`).join("")}
      </div>
      <div id="exercise-feedback" aria-live="polite"></div>
    </section>`;
}

function answerQuestion(isCorrect, selectedElement) {
  if (currentSession.answered) return;
  currentSession.answered = true;
  const word = currentSession.words[currentSession.index];
  const progress = getWordProgress(word.id);
  progress.seen += 1;
  progress.attempts += 1;
  if (isCorrect) {
    progress.correct += 1;
    progress.box = Math.min(5, progress.box + 1);
    currentSession.correct += 1;
    currentSession.xp += 10;
  } else {
    progress.box = Math.max(0, progress.box - 1);
  }
  progress.due = addDays(localDateKey(), INTERVALS[progress.box]);
  state.words[word.id] = progress;

  const choiceButtons = document.querySelectorAll(".choice-button");
  choiceButtons.forEach(button => {
    button.disabled = true;
    if (button.dataset.choice === word.translation) button.classList.add("is-correct");
  });
  if (!isCorrect && selectedElement?.classList.contains("choice-button")) selectedElement.classList.add("is-wrong");
  if (selectedElement?.matches("input")) {
    selectedElement.disabled = true;
    selectedElement.classList.add(isCorrect ? "is-correct" : "is-wrong");
    document.querySelector("#typing-form button").disabled = true;
  }

  document.querySelector("#exercise-feedback").innerHTML = `
    <div class="feedback-box ${isCorrect ? "correct" : "wrong"}">
      <p><strong>${isCorrect ? "Верно!" : "Почти!"}</strong><span>${isCorrect ? `Следующее повторение: через ${INTERVALS[progress.box]} дн.` : `Правильный ответ: ${word.word}`}</span></p>
      <button class="primary-button" type="button" data-session-action="next">Дальше →</button>
    </div>`;
  document.querySelector("[data-session-action='next']")?.focus();
}

function nextQuestion() {
  currentSession.index += 1;
  currentSession.phase = currentSession.mode === "learn" && currentSession.index < currentSession.words.length ? "reveal" : "question";
  renderSession();
}

function renderFinish() {
  const total = currentSession.words.length;
  const earnedXp = currentSession.xp;
  state.xp += earnedXp;
  recordActivity(earnedXp, currentSession.correct, total);
  saveState();
  const accuracy = Math.round((currentSession.correct / total) * 100);
  document.querySelector("#session-progress-bar").style.width = "100%";
  document.querySelector("#session-content").innerHTML = `
    <section class="finish-card" aria-labelledby="session-title">
      <div class="finish-burst" aria-hidden="true">✓</div>
      <span class="exercise-kicker">Круг завершён</span>
      <h2 id="session-title">Отличная работа!</h2>
      <p>${accuracy >= 80 ? "Слова уже начинают переходить в долгую память." : "Ошибки — часть маршрута. Слова вернутся совсем скоро."}</p>
      <div class="finish-stats">
        <div><strong>+${earnedXp}</strong><span>опыта</span></div>
        <div><strong>${currentSession.correct}/${total}</strong><span>верных ответов</span></div>
        <div><strong>${accuracy}%</strong><span>точность</span></div>
      </div>
      <button class="primary-button" type="button" data-session-action="finish">Вернуться к маршруту</button>
    </section>`;
  renderAll();
}

function closeSession() {
  if (!currentSession) return;
  const inProgress = currentSession.index < currentSession.words.length;
  if (inProgress && currentSession.index > 0 && !confirm("Закрыть занятие? Прогресс этого раунда сохранится только после завершения.")) return;
  document.querySelector("#lesson-dialog").close();
  document.body.style.overflow = "";
  currentSession = null;
}

function handleQuickAnswer(button) {
  if (document.querySelector("#quick-answers").dataset.answered === "true") return;
  const correct = button.dataset.answer === "любопытный";
  document.querySelector("#quick-answers").dataset.answered = "true";
  document.querySelectorAll("#quick-answers .answer-button").forEach(item => {
    item.disabled = true;
    if (item.dataset.answer === "любопытный") item.classList.add("is-correct");
  });
  if (!correct) button.classList.add("is-wrong");
  const feedback = document.querySelector("#quick-feedback");
  if (correct && state.quickDoneAt !== localDateKey()) {
    state.quickDoneAt = localDateKey();
    state.xp += 5;
    recordActivity(5, 1, 1);
    saveState();
    renderAll();
    feedback.textContent = "Верно — +5 XP! Curious значит «любопытный».";
  } else {
    feedback.textContent = correct ? "Верно! Сегодняшние +5 XP уже у тебя." : "Не страшно: curious — «любопытный».";
  }
}

function renderQuickAnswers() {
  const choices = ["любопытный", "осторожный", "обычный"];
  document.querySelector("#quick-answers").innerHTML = choices.map(choice => `<button class="answer-button" type="button" data-answer="${choice}">${choice}</button>`).join("");
  document.querySelector("#quick-answers").dataset.answered = "false";
}

function speakWord(text) {
  if (!("speechSynthesis" in window)) return showToast("Озвучивание не поддерживается в этом браузере");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = .85;
  speechSynthesis.speak(utterance);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function resetProgress() {
  if (!confirm("Сбросить весь прогресс, серию и изученные слова? Это действие нельзя отменить.")) return;
  Object.assign(state, createDefaultState());
  saveState();
  renderQuickAnswers();
  renderAll();
  showToast("Прогресс сброшен");
}

function progressSnapshot() {
  const activity = Object.values(state.activity);
  const totalAttempts = activity.reduce((sum, day) => sum + day.total, 0);
  const totalCorrect = activity.reduce((sum, day) => sum + day.correct, 0);
  return {
    xp: state.xp,
    streakDays: calculateStreak(),
    learnedWords: learnedWords().length,
    masteredWords: masteredWords().length,
    dueWords: dueWords().length,
    accuracyPercent: totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  };
}

function registerModelTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const reportRegistrationError = error => console.warn("Bridge tool registration failed", error);
  const register = tool => {
    try {
      void Promise.resolve(context.registerTool(tool)).catch(reportRegistrationError);
    } catch (error) {
      reportRegistrationError(error);
    }
  };

  register({
    name: "get_bridge_learning_progress",
    title: "Показать прогресс в Bridge",
    description: "Возвращает текущий учебный прогресс пользователя: XP, серию, словарь, точность и число слов к повторению.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute() {
      return progressSnapshot();
    }
  });

  register({
    name: "start_bridge_lesson",
    title: "Начать урок в Bridge",
    description: "Открывает учебный раунд по одной из доступных тем в видимом интерфейсе Bridge.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: TOPICS.map(item => item.id),
          description: "Тема урока: mind, travel, daily или feelings."
        }
      },
      required: ["topic"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const topic = typeof input === "object" && input ? input.topic : undefined;
      if (!TOPICS.some(item => item.id === topic)) throw new Error("Неизвестная тема урока.");
      switchView("learn");
      startTopic(topic);
      return { status: "started", topic, wordCount: WORDS.filter(word => word.topic === topic).length };
    }
  });
}

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view-target]");
  if (viewButton) return switchView(viewButton.dataset.viewTarget);
  const topic = event.target.closest("[data-topic]");
  if (topic) return startTopic(topic.dataset.topic);
  const choice = event.target.closest("[data-choice]");
  if (choice && currentSession) return answerQuestion(choice.dataset.choice === currentSession.words[currentSession.index].translation, choice);
  const quick = event.target.closest("[data-answer]");
  if (quick) return handleQuickAnswer(quick);
  const action = event.target.closest("[data-session-action]")?.dataset.sessionAction;
  if (action === "question") { currentSession.phase = "question"; return renderSession(); }
  if (action === "next") return nextQuestion();
  if (action === "finish") return closeSession();
  const speak = event.target.closest("[data-speak]");
  if (speak) return speakWord(speak.dataset.speak);
});

document.addEventListener("submit", event => {
  if (event.target.id !== "typing-form" || !currentSession) return;
  event.preventDefault();
  if (currentSession.answered) return;
  const input = document.querySelector("#typing-answer");
  const answer = input.value.trim().toLowerCase();
  if (!answer) return input.focus();
  answerQuestion(answer === currentSession.words[currentSession.index].word.toLowerCase(), input);
});

document.addEventListener("keydown", event => {
  if (currentSession && currentSession.phase === "question" && /^[1-4]$/.test(event.key)) {
    const button = document.querySelectorAll(".choice-button")[Number(event.key) - 1];
    if (button && !button.disabled) button.click();
  }
});

document.querySelector("#start-daily").addEventListener("click", startDaily);
document.querySelector("#start-review").addEventListener("click", startReview);
document.querySelector("#close-session").addEventListener("click", closeSession);
document.querySelector("#reset-progress").addEventListener("click", resetProgress);
document.querySelector("#avatar-button").addEventListener("click", () => switchView("progress"));
document.querySelector("#lesson-dialog").addEventListener("cancel", event => { event.preventDefault(); closeSession(); });
window.addEventListener("hashchange", () => switchView(location.hash.slice(1), false));

document.querySelector("#page-title").textContent = getGreeting();
document.querySelector("#today-label").textContent = formatToday();
renderQuickAnswers();
renderAll();
switchView(location.hash.slice(1) || "today", false);
registerModelTools();
