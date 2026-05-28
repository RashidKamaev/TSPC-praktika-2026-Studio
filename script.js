const routes = document.querySelectorAll('[data-route]');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav__link');
const mobileMenu = document.getElementById('mobileMenu');
const burger = document.getElementById('burger');
const header = document.getElementById('header');
const themeToggle = document.getElementById('themeToggle');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const linkInput = document.getElementById('linkInput');
const uploadError = document.getElementById('uploadError');
const fileField = document.querySelector('.file-field');
const fileFieldText = document.getElementById('fileFieldText');
const fileState = document.getElementById('fileState');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const costModal = document.getElementById('costModal');
const modalClose = document.getElementById('modalClose');
const confirmCost = document.getElementById('confirmCost');
const costTitle = document.getElementById('costTitle');
const costType = document.getElementById('costType');
const queueList = document.getElementById('queueList');
const historyList = document.getElementById('historyList');
const searchInput = document.getElementById('searchInput');
const filterInput = document.getElementById('filterInput');
const balanceForm = document.getElementById('balanceForm');
const amountInput = document.getElementById('amountInput');
const balanceMessage = document.getElementById('balanceMessage');
const profileForm = document.getElementById('profileForm');

let lastScroll = 0;
let pendingFile = null;

const historyData = [
  { name: 'Встреча с командой.mp4', type: 'video', date: '20.05.2026', status: 'Готово', comment: 'Управленческая выжимка' },
  { name: 'Интервью с клиентом.wav', type: 'audio', date: '19.05.2026', status: 'Готово', comment: 'Краткое содержание' },
  { name: 'Планирование проекта.mp3', type: 'audio', date: '18.05.2026', status: 'Готово', comment: 'Задачи специалистам' }
];

const queueData = [
  { name: 'Обзор рынка 2026.mp4', type: 'Видео', status: 'Обрабатывается', progress: 72 },
  { name: 'Созвон с партнером.wav', type: 'Аудио', status: 'В очереди', progress: 12 },
  { name: 'Лекция по UX.mp3', type: 'Аудио', status: 'Анализируется', progress: 35 }
];

function setRoute(route) {
  pages.forEach(page => page.classList.toggle('active', page.id === route));
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.route === route));
  mobileMenu.classList.remove('open');
  window.location.hash = route;
}

routes.forEach(item => {
  item.addEventListener('click', event => {
    event.preventDefault();
    setRoute(item.dataset.route);
  });
});

burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

window.addEventListener('scroll', () => {
  if (window.innerWidth > 900) return;
  const currentScroll = window.scrollY;
  header.classList.toggle('hidden', currentScroll > lastScroll && currentScroll > 90);
  lastScroll = currentScroll;
});

function renderQueue() {
  queueList.innerHTML = queueData.map(item => `
    <article class="queue__item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.type} · ${item.status}</p>
        <div class="progress"><span style="width:${item.progress}%"></span></div>
      </div>
      <span class="badge">${item.progress}%</span>
    </article>
  `).join('');
}

function formatFileSize(bytes) {
  if (!bytes) return '0 МБ';
  return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];

  if (!file) {
    fileState.hidden = true;
    fileField.classList.remove('is-selected');
    fileFieldText.textContent = 'Выбрать файл';
    return;
  }

  fileName.textContent = file.name;
  fileSize.textContent = `${formatFileSize(file.size)} · файл добавлен`;
  fileFieldText.textContent = 'Файл выбран';
  fileField.classList.add('is-selected');
  fileState.hidden = false;
  uploadError.textContent = '';
});

function renderHistory() {
  const search = searchInput.value.toLowerCase().trim();
  const filter = filterInput.value;
  const filtered = historyData.filter(item => {
    const bySearch = item.name.toLowerCase().includes(search);
    const byFilter = filter === 'all' || item.type === filter;
    return bySearch && byFilter;
  });

  historyList.innerHTML = filtered.length ? filtered.map(item => `
    <article class="history-card">
      <div>
        <h3>${item.name}</h3>
        <p>${item.date} · ${item.comment}</p>
      </div>
      <span class="badge success">${item.status}</span>
    </article>
  `).join('') : '<article class="history-card"><p>Ничего не найдено</p></article>';
}

uploadForm.addEventListener('submit', event => {
  event.preventDefault();
  const file = fileInput.files[0];
  const link = linkInput.value.trim();

  if (!file && !link) {
    uploadError.textContent = 'Выберите файл или вставьте ссылку.';
    return;
  }

  if (link && !/^https?:\/\/.+/.test(link)) {
    uploadError.textContent = 'Ссылка должна начинаться с http:// или https://';
    return;
  }

  uploadError.textContent = '';
  pendingFile = file ? file.name : 'Файл по ссылке';
  costTitle.textContent = pendingFile;
  costType.textContent = file && file.type.startsWith('video') ? 'Видео' : 'Аудио';
  costModal.classList.add('active');
});

modalClose.addEventListener('click', () => costModal.classList.remove('active'));

confirmCost.addEventListener('click', () => {
  queueData.unshift({ name: pendingFile, type: costType.textContent, status: 'В очереди', progress: 0 });
  renderQueue();
  costModal.classList.remove('active');
  setRoute('processing');
});

document.querySelectorAll('[data-amount]').forEach(button => {
  button.addEventListener('click', () => {
    amountInput.value = button.dataset.amount;
  });
});

balanceForm.addEventListener('submit', event => {
  event.preventDefault();
  const amount = Number(amountInput.value);
  balanceMessage.style.color = '';
  if (!amount || amount < 100) {
    balanceMessage.textContent = 'Минимальная сумма пополнения — 100 ₽.';
    return;
  }
  balanceMessage.style.color = 'var(--success)';
  balanceMessage.textContent = 'Оплата успешно подготовлена.';
});

profileForm.addEventListener('submit', event => {
  event.preventDefault();
  alert('Профиль сохранен');
});

searchInput.addEventListener('input', renderHistory);
filterInput.addEventListener('change', renderHistory);

renderQueue();
renderHistory();
setRoute(location.hash.replace('#', '') || 'home');
