// app.js - simple SPA logic
const authCard = document.getElementById('authCard');
const dashboard = document.getElementById('dashboard');
const profileCard = document.getElementById('profileCard');
const userLine = document.getElementById('userLine');

const tabs = document.querySelectorAll('.tab');
const authForm = document.getElementById('authForm');
const authSubmit = document.getElementById('authSubmit');
const authMsg = document.getElementById('authMsg');
const labelUser = document.getElementById('labelUser');
let currentTab = 'login';

tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  currentTab = t.dataset.tab;
  authSubmit.textContent = currentTab === 'login' ? 'Login' : 'Register';
  labelUser.textContent = currentTab === 'login' ? 'Username or Email' : 'Username';
}));

// helper
function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
function getToken(){ return localStorage.getItem('token'); }

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMsg.textContent = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) { authMsg.textContent = 'Please fill all fields'; return; }

  if (currentTab === 'register') {
    // register
    try {
      const body = {username, email: username.includes('@') ? username : `${username}@example.com`, password};
      const res = await fetch('/api/register', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
        showDashboard();
        await loadProfile();
      } else {
        authMsg.textContent = data.message || JSON.stringify(data);
      }
    } catch (err) { authMsg.textContent = 'Network error'; }
  } else {
    // login
    try {
      const body = {username, password};
      const res = await fetch('/api/login', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
        showDashboard();
        await loadProfile();
      } else {
        authMsg.textContent = data.message || JSON.stringify(data);
      }
    } catch (err) { authMsg.textContent = 'Network error'; }
  }
});

// SPA nav
document.getElementById('navSend').addEventListener('click', () => {
  document.querySelector('.send-card').scrollIntoView({behavior:'smooth'});
});
document.getElementById('navProfile').addEventListener('click', () => {
  profileCard.classList.remove('hidden');
  profileCard.scrollIntoView({behavior:'smooth'});
});
document.getElementById('navDashboard').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
document.getElementById('logoutBtn').addEventListener('click', () => {
  setToken(null);
  location.reload();
});

// send-sms
document.getElementById('sendBtn').addEventListener('click', async () => {
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const amount = parseInt(document.getElementById('amount').value || '1', 10);
  const resBox = document.getElementById('sendResult');
  resBox.textContent = '';
  if (!/^(09|9)\d{8,9}$/.test(phoneNumber)) {
    resBox.textContent = 'Invalid phone number format';
    return;
  }
  if (amount < 1 || amount > 50) { resBox.textContent = 'Amount must be between 1 and 50'; return; }

  try {
    const r = await fetch('/api/send-sms', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': getToken() ? `Bearer ${getToken()}` : ''
      },
      body: JSON.stringify({phoneNumber, amount})
    });
    const data = await r.json();
    if (data.success) {
      document.getElementById('resultsPre').textContent = JSON.stringify(data.data, null, 2);
      resBox.textContent = data.message || 'Success';
    } else {
      resBox.textContent = data.message || JSON.stringify(data);
    }
  } catch (err) {
    resBox.textContent = 'Network error';
  }
});

// load profile
async function loadProfile(){
  try {
    const r = await fetch('/api/profile', {
      headers: {'Authorization': getToken() ? `Bearer ${getToken()}` : ''}
    });
    const data = await r.json();
    if (data.success && data.data) {
      userLine.textContent = data.data.user.username + ' · credits: ' + data.data.user.credits;
      document.getElementById('apiKeyBox').textContent = data.data.apiKey.key;
      document.getElementById('profileInfo').innerHTML = `
        <div><strong>${data.data.user.username}</strong></div>
        <div style="color:var(--muted)">${data.data.user.email}</div>
        <div style="margin-top:8px">Credits: <strong>${data.data.user.credits}</strong></div>
      `;
    } else {
      userLine.textContent = 'Not logged';
    }
  } catch (err) {
    userLine.textContent = 'Error loading profile';
  }
}

function showDashboard(){
  authCard.classList.add('hidden');
  dashboard.classList.remove('hidden');
  profileCard.classList.add('hidden');
}

// init
(function init(){
  if (getToken()) {
    showDashboard();
    loadProfile();
  } else {
    authCard.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }

  // update creditsNeeded text based on amount (example rule: credits = amount*10)
  const amountEl = document.getElementById('amount');
  const creditsEl = document.getElementById('creditsNeeded');
  function updCredits(){ creditsEl.textContent = Math.max(1, parseInt(amountEl.value||'1',10))*10; }
  amountEl.addEventListener('input', updCredits);
  updCredits();
})();
