// ======= Data Storage Keys ==========
const EMPLOYEE_STORAGE_KEY = 'ut_employees';
const ATTENDANCE_STORAGE_KEY = 'ut_attendance_records';

// ======= Simple Admin Credentials (hardcoded for demo) =======
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// ======= Elements ========
const loginPage = document.getElementById('login-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const mainApp = document.getElementById('main-app');
const navButtons = document.querySelectorAll('nav button[data-section]');
const contentArea = document.getElementById('content-area');
const logoutBtn = document.getElementById('logout-btn');

// ======= Login Logic =======
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    loginError.textContent = '';
    loginPage.style.display = 'none';
    mainApp.style.display = 'flex';
    renderDashboard();
  } else {
    loginError.textContent = 'Invalid username or password.';
  }
});

logoutBtn.addEventListener('click', () => {
  if(confirm('Are you sure you want to logout?')) {
    loginPage.style.display = 'flex';
    mainApp.style.display = 'none';
    loginForm.reset();
    loginError.textContent = '';
    navButtons.forEach(b => b.classList.remove('active'));
    navButtons[0].classList.add('active');
  }
});

// ======= Load Employees from localStorage or default =======
function loadEmployees() {
  const data = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
  if(data) return JSON.parse(data);
  // Default demo employees
  const defaultEmps = [
    { id: 'E001', name: 'Rajkumar Rao', email: 'rajkumar@universaltribes.com', phone: '9876543210', position: 'HR Manager' },
    { id: 'E002', name: 'Amisha Rawat', email: 'amisha@universaltribes.com', phone: '9123456789', position: 'Sales Executive' },
    { id: 'E003', name: 'Priyanka Chaudhary', email: 'priyanka@universaltribes.com', phone: '9988776655', position: 'Marketing Intern' }
  ];
  localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(defaultEmps));
  return defaultEmps;
}

// ======= Save Employees to localStorage =======
function saveEmployees(employees) {
  localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
}

// ======= Render Dashboard =======
// Function to format date and time nicely
function formatDateTime(date) {
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Updated renderDashboard to show live date/time
function renderDashboard() {
  contentArea.innerHTML = `
    <h2>Dashboard</h2>
    <p>Welcome to Universal Tribes HRMS. Use the navigation menu to manage employees and attendance.</p>
    <div id="live-date-time" style="font-weight:bold; margin-top:20px; font-size:16px;"></div>
  `;

  const dateTimeElem = document.getElementById('live-date-time');
  function updateDateTime() {
    const now = new Date();
    dateTimeElem.textContent = 'Current Date & Time: ' + formatDateTime(now);
  }

  updateDateTime(); // show immediately
  setInterval(updateDateTime, 1000); // update every second
}

// ======= Render Employee Directory =======
function renderEmployeeDirectory() {
  const employees = loadEmployees();
  let html = `
    <h2>Employee Directory</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Position</th></tr>
      </thead>
      <tbody>
        ${employees.map(emp => `
          <tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>${emp.position}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  contentArea.innerHTML = html;
}

// ======= Attendance Logic =======

function loadAttendance() {
  const data = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveAttendance(attendance) {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
}

function renderAttendanceSection() {
  const employees = loadEmployees();
  const attendanceRecords = loadAttendance();

  const today = new Date().toISOString().slice(0, 10);

  let html = `
    <h2>Attendance Tracking</h2>
    <label for="attendance-date">Select Date: </label>
    <input type="date" id="attendance-date" value="${today}" max="${today}" />
    <form id="attendance-form">
      <table>
        <thead>
          <tr><th>Employee Name</th><th>Attendance</th></tr>
        </thead>
        <tbody>
          ${employees.map(emp => `
            <tr data-id="${emp.id}">
              <td>${emp.name}</td>
              <td style="text-align:center;">
                <label><input type="radio" name="att-${emp.id}" value="Present" /> Present</label>
                <label style="margin-left:15px;"><input type="radio" name="att-${emp.id}" value="Absent" /> Absent</label>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button type="submit" style="margin-top:15px; padding:10px 20px; font-size:16px; cursor:pointer;">Save Attendance</button>
    </form>
    <p id="attendance-msg" style="color:green; font-weight:bold; margin-top:12px;"></p>
  `;

  contentArea.innerHTML = html;

  function setAttendanceForDate(date) {
    const attendanceForDate = attendanceRecords[date] || {};
    employees.forEach(emp => {
      const status = attendanceForDate[emp.id] || null;
      if(status) {
        const radio = document.querySelector(`input[name="att-${emp.id}"][value="${status}"]`);
        if(radio) radio.checked = true;
      } else {
        const radios = document.querySelectorAll(`input[name="att-${emp.id}"]`);
        radios.forEach(r => r.checked = false);
      }
    });
  }

  const dateInput = document.getElementById('attendance-date');
  dateInput.addEventListener('change', () => {
    setAttendanceForDate(dateInput.value);
    document.getElementById('attendance-msg').textContent = '';
  });

  setAttendanceForDate(today);

  const attendanceForm = document.getElementById('attendance-form');
  attendanceForm.addEventListener('submit', e => {
    e.preventDefault();
    const selectedDate = dateInput.value;
    if(!selectedDate) {
      alert('Please select a date.');
      return;
    }

    let attendanceForDate = attendanceRecords[selectedDate] || {};

    employees.forEach(emp => {
      const selectedRadio = document.querySelector(`input[name="att-${emp.id}"]:checked`);
      attendanceForDate[emp.id] = selectedRadio ? selectedRadio.value : 'Absent';
    });

    attendanceRecords[selectedDate] = attendanceForDate;
    saveAttendance(attendanceRecords);

    document.getElementById('attendance-msg').textContent = `Attendance saved for ${selectedDate}.`;
  });
}

// ======= Navigation Buttons =======
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switch(btn.dataset.section) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'employees':
        renderEmployeeDirectory();
        break;
      case 'attendance':
        renderAttendanceSection();
        break;
      default:
        contentArea.innerHTML = '<p>Section under construction</p>';
    }
  });
});
