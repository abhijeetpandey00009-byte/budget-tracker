// ══════════════════════════════════
// DATA STORE
// ══════════════════════════════════
let currentUser = null;
let currentType = 'expense';
let transactions = [];

const colors = ['#f7c948','#22d98a','#4fa3ff','#e84393','#a78bfa','#ff8c42'];

const members = [
  { name: 'Rahul', role: 'Admin', avatar: 'R', color: colors[0] },
  { name: 'Priya', role: 'Member', avatar: 'P', color: colors[1] },
  { name: 'Arjun', role: 'Member', avatar: 'A', color: colors[2] },
  { name: 'Nisha', role: 'Member', avatar: 'N', color: colors[3] },
];

const goals = [
  { emoji: '🏠', name: 'New Home', saved: 180000, target: 500000, color: '#4fa3ff' },
  { emoji: '✈️', name: 'Family Trip', saved: 45000, target: 80000, color: '#22d98a' },
  { emoji: '🎓', name: "Arjun's Education", saved: 90000, target: 200000, color: '#a78bfa' },
  { emoji: '🚗', name: 'New Car', saved: 60000, target: 400000, color: '#f7c948' },
];

const sampleTxns = [
  { id: 1, desc: 'Monthly Salary', amount: 75000, type: 'income', cat: '💼 Salary', member: 'Rahul', date: '2026-06-01' },
  { id: 2, desc: 'Grocery Shopping', amount: 3200, type: 'expense', cat: '🛒 Groceries', member: 'Priya', date: '2026-06-02' },
  { id: 3, desc: 'Monthly Salary', amount: 55000, type: 'income', cat: '💼 Salary', member: 'Priya', date: '2026-06-01' },
  { id: 4, desc: 'School Fees', amount: 12000, type: 'expense', cat: '📚 Education', member: 'Arjun', date: '2026-06-03' },
  { id: 5, desc: 'SIP Investment', amount: 10000, type: 'saving', cat: '📈 Investment', member: 'Rahul', date: '2026-06-01' },
  { id: 6, desc: 'Dinner at Restaurant', amount: 1800, type: 'expense', cat: '🍔 Food & Dining', member: 'Nisha', date: '2026-06-04' },
  { id: 7, desc: 'Electricity Bill', amount: 2400, type: 'expense', cat: '⚡ Utilities', member: 'Rahul', date: '2026-06-03' },
  { id: 8, desc: 'Family Trip Saving', amount: 5000, type: 'saving', cat: '✈️ Travel', member: 'Priya', date: '2026-06-02' },
];
transactions = [...sampleTxns];

let charts = {};

// ══ LOGIN ══
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'signup' && i === 1));
  });
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

function doLogin() {
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!id || !pass) { alert('Please enter your login details'); return; }
  const name = id.includes('@') ? id.split('@')[0] : 'User ' + id.slice(-4);
  launchApp(name);
}

function doSignup() {
  const name = document.getElementById('signupName').value.trim();
  const id = document.getElementById('signupId').value.trim();
  if (!name || !id) { alert('Please fill all fields'); return; }
  launchApp(name);
}

function quickLogin(method) {
  launchApp(method === 'Google' ? 'Google User' : 'OTP User');
}

function launchApp(name) {
  currentUser = name;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';
  document.getElementById('fab').style.display = 'flex';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();

  const sel = document.getElementById('txnMember');
  sel.innerHTML = members.map(m => `<option>${m.name}</option>`).join('');

  renderAll();
  setTimeout(initCharts, 100);
}

function doLogout() {
  document.getElementById('appScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('fab').style.display = 'none';
}

// ══ NAVIGATION ══
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.trim().toLowerCase().includes(
      id === 'dashboard' ? 'dashboard' : id === 'transactions' ? 'transaction' :
      id === 'savings' ? 'saving' : id === 'analytics' ? 'analytics' :
      id === 'leaderboard' ? 'leaderboard' : 'member'
    )) n.classList.add('active');
  });
  if (id === 'analytics') setTimeout(initAnalyticsCharts, 100);
}

// ══ MODAL ══
function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

function setType(t) {
  currentType = t;
  ['expense','income','saving'].forEach(type => {
    const btn = document.getElementById('btn' + type.charAt(0).toUpperCase() + type.slice(1));
    btn.className = 'type-btn';
    if (type === t) btn.className = 'type-btn active-' + t;
  });
}

function addTransaction() {
  const desc = document.getElementById('txnDesc').value.trim();
  const amount = parseFloat(document.getElementById('txnAmount').value);
  const cat = document.getElementById('txnCat').value;
  const member = document.getElementById('txnMember').value;
  if (!desc || !amount) { alert('Please fill description and amount'); return; }
  const txn = {
    id: Date.now(), desc, amount, type: currentType, cat, member,
    date: new Date().toISOString().split('T')[0]
  };
  transactions.unshift(txn);
  closeModal();
  document.getElementById('txnDesc').value = '';
  document.getElementById('txnAmount').value = '';
  renderAll();
  updateCharts();
  showToast('✓ Transaction added!');
}

// ══ RENDER ══
function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }

function renderAll() {
  renderStats();
  renderTxnList('recentTxnList', transactions.slice(0, 6));
  renderTxnList('fullTxnList', transactions);
  renderLeaderboard();
  renderGoals();
  renderMembers();
}

function renderStats() {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expense;
  const rate = income ? Math.round((savings / income) * 100) : 0;
  document.getElementById('statIncome').textContent = fmt(income);
  document.getElementById('statExpense').textContent = fmt(expense);
  document.getElementById('statSavings').textContent = fmt(savings);
  document.getElementById('statRate').textContent = rate + '%';

  const totalSaved = transactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  document.getElementById('goalTotalSaved').textContent = fmt(totalSaved);
}

function renderTxnList(elId, txns) {
  const el = document.getElementById(elId);
  if (!txns.length) {
    el.innerHTML = `<div class="txn-header"><div>Description</div><div>Member</div><div>Date</div><div style="text-align:right">Amount</div></div><div class="empty-state"><span class="emoji">📭</span>No transactions yet</div>`;
    return;
  }
  const rows = txns.map(t => {
    const m = members.find(x => x.name === t.member) || { color: '#888', avatar: t.member[0] };
    const cls = t.type === 'expense' ? 'amount-expense' : t.type === 'income' ? 'amount-income' : 'amount-saving';
    const sign = t.type === 'expense' ? '−' : '+';
    const chipCls = 'chip chip-' + t.type;
    return `<div class="txn-row">
      <div>
        <div class="txn-name">${t.desc}</div>
        <div class="txn-cat"><span class="${chipCls}">${t.cat}</span></div>
      </div>
      <div class="txn-member">
        <div class="mini-avatar" style="background:${m.color}">${m.avatar}</div>
        ${t.member}
      </div>
      <div class="txn-date">${t.date}</div>
      <div class="txn-amount ${cls}">${sign}${fmt(t.amount)}</div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="txn-header"><div>Description</div><div>Member</div><div>Date</div><div style="text-align:right">Amount</div></div>${rows}`;
}

function renderLeaderboard() {
  const scores = members.map(m => {
    const income = transactions.filter(t => t.member === m.name && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.member === m.name && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const saving = transactions.filter(t => t.member === m.name && t.type === 'saving').reduce((s, t) => s + t.amount, 0);
    const score = Math.max(0, income - expense + saving);
    return { ...m, income, expense, saving, score };
  }).sort((a, b) => b.score - a.score);

  const max = scores[0]?.score || 1;
  const medals = ['🥇', '🥈', '🥉'];
  const el = document.getElementById('lbList');
  el.innerHTML = scores.map((m, i) => `
    <div class="lb-row">
      <div class="lb-rank ${i < 3 ? 'rank-' + (i + 1) : ''}">${medals[i] || (i + 1)}</div>
      <div class="lb-avatar" style="background:${m.color}">${m.avatar}</div>
      <div class="lb-info">
        <div class="lb-name">${m.name} ${i === 0 ? '👑' : ''}</div>
        <div class="lb-detail">💰 ${fmt(m.income)} in · 🛒 ${fmt(m.expense)} out · 🎯 ${fmt(m.saving)} saved</div>
      </div>
      <div class="lb-bar"><div class="lb-bar-fill" style="width:${Math.round((m.score / max) * 100)}%;background:${m.color}"></div></div>
      <div class="lb-score">
        <div class="lb-score-val">${fmt(m.score)}</div>
        <div class="lb-score-label">Net Score</div>
      </div>
    </div>
  `).join('');
}

function renderGoals() {
  const el = document.getElementById('goalsGrid');
  el.innerHTML = goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<div class="goal-card">
      <div class="goal-header">
        <div class="goal-name">${g.name}</div>
        <div class="goal-emoji">${g.emoji}</div>
      </div>
      <div class="goal-amount">${fmt(g.saved)}</div>
      <div class="goal-target">of ${fmt(g.target)} goal · ${pct}% done</div>
      <div class="goal-bar-bg"><div class="goal-bar" style="width:${pct}%;background:linear-gradient(90deg,${g.color},${g.color}88)"></div></div>
      <div class="goal-pct"><span>₹${(g.target - g.saved).toLocaleString('en-IN')} remaining</span><span>${pct}%</span></div>
    </div>`;
  }).join('');
}

function renderMembers() {
  const el = document.getElementById('membersList');
  el.innerHTML = members.map(m => {
    const exp = transactions.filter(t => t.member === m.name && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inc = transactions.filter(t => t.member === m.name && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    return `<div class="stat-card" style="border-top:3px solid ${m.color}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:48px;height:48px;border-radius:50%;background:${m.color};display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#000">${m.avatar}</div>
        <div><div style="font-weight:600;font-size:16px">${m.name}</div><div style="font-size:12px;color:var(--muted)">${m.role}</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px">
        <span style="color:var(--green)">💰 ${fmt(inc)}</span>
        <span style="color:var(--red)">🛒 ${fmt(exp)}</span>
      </div>
    </div>`;
  }).join('');
}

function addMemberPrompt() {
  const name = prompt('Enter member name:');
  if (name) {
    members.push({ name: name.trim(), role: 'Member', avatar: name.trim()[0].toUpperCase(), color: colors[members.length % colors.length] });
    const sel = document.getElementById('txnMember');
    sel.innerHTML = members.map(m => `<option>${m.name}</option>`).join('');
    renderMembers();
    renderLeaderboard();
    showToast('✓ Member added!');
  }
}

// ══ CHARTS ══
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: { legend: { labels: { color: '#6e7a96', font: { family: 'DM Sans', size: 12 }, boxWidth: 12, padding: 10 } } },
  scales: {
    x: { ticks: { color: '#6e7a96', maxRotation: 0 }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#6e7a96', callback: v => '₹' + (v/1000) + 'k' }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

function safeDestroy(key) { if (charts[key]) { charts[key].destroy(); delete charts[key]; } }

function initCharts() {
  safeDestroy('monthly'); safeDestroy('donut');
  const mCtx = document.getElementById('monthlyChart').getContext('2d');
  charts.monthly = new Chart(mCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'Income', data: [120000, 130000, 125000, 135000, 128000, 130000], backgroundColor: 'rgba(34,217,138,0.75)', borderRadius: 5, barPercentage: 0.6 },
        { label: 'Expenses', data: [85000, 90000, 88000, 92000, 86000, 89000], backgroundColor: 'rgba(255,90,90,0.75)', borderRadius: 5, barPercentage: 0.6 },
        { label: 'Savings', data: [15000, 20000, 17000, 22000, 18000, 15000], backgroundColor: 'rgba(79,163,255,0.75)', borderRadius: 5, barPercentage: 0.6 },
      ]
    },
    options: { ...chartDefaults }
  });

  const dCtx = document.getElementById('donutChart').getContext('2d');
  charts.donut = new Chart(dCtx, {
    type: 'doughnut',
    data: {
      labels: ['Groceries', 'Education', 'Food', 'Utilities', 'Entertainment', 'Other'],
      datasets: [{ data: [3200, 12000, 1800, 2400, 3000, 2000], backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600 }, plugins: { legend: { labels: { color: '#6e7a96', font: { family: 'DM Sans', size: 11 }, padding: 8, boxWidth: 10 } } }, cutout: '65%' }
  });
}

function initAnalyticsCharts() {
  ['trend','memberPie','week','cat'].forEach(k => safeDestroy(k));

  const tCtx = document.getElementById('trendChart').getContext('2d');
  charts.trend = new Chart(tCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'Income', data: [120000, 130000, 125000, 135000, 128000, 130000], borderColor: '#22d98a', backgroundColor: 'rgba(34,217,138,0.08)', fill: true, tension: 0.4, pointRadius: 4 },
        { label: 'Expenses', data: [85000, 90000, 88000, 92000, 86000, 89000], borderColor: '#ff5a5a', backgroundColor: 'rgba(255,90,90,0.08)', fill: true, tension: 0.4, pointRadius: 4 },
      ]
    },
    options: { ...chartDefaults }
  });

  const mpCtx = document.getElementById('memberChart').getContext('2d');
  const memberExpenses = members.map(m => transactions.filter(t => t.member === m.name && t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  charts.memberPie = new Chart(mpCtx, {
    type: 'polarArea',
    data: { labels: members.map(m => m.name), datasets: [{ data: memberExpenses, backgroundColor: colors.map(c => c + 'bb'), borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600 }, plugins: { legend: { labels: { color: '#6e7a96', font: { family: 'DM Sans', size: 12 } } } } }
  });

  const wCtx = document.getElementById('weekChart').getContext('2d');
  charts.week = new Chart(wCtx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ label: 'Spending', data: [4200, 3800, 5100, 4700, 6200, 8900, 3100], backgroundColor: colors[0] + 'cc', borderRadius: 6, barPercentage: 0.6 }]
    },
    options: { ...chartDefaults }
  });

  const cCtx = document.getElementById('catChart').getContext('2d');
  charts.cat = new Chart(cCtx, {
    type: 'bar',
    data: {
      labels: ['Groceries', 'Education', 'Food', 'Utilities', 'Travel', 'Other'],
      datasets: [{ label: 'Amount', data: [3200, 12000, 1800, 2400, 5000, 2000], backgroundColor: colors.slice(0, 6).map(c => c + 'cc'), borderRadius: 6, barPercentage: 0.6 }]
    },
    options: { ...chartDefaults, indexAxis: 'y', scales: { x: { ticks: { color: '#6e7a96', callback: v => '₹' + (v/1000) + 'k' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#6e7a96' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
  });
}

function updateCharts() {
  if (!charts.donut) return;
  const cats = ['🛒 Groceries', '📚 Education', '🍔 Food & Dining', '⚡ Utilities', '🎮 Entertainment', '🎁 Other'];
  const vals = cats.map(c => transactions.filter(t => t.cat === c && t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  charts.donut.data.datasets[0].data = vals;
  charts.donut.update();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
