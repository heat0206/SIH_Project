// View/Edit Attendance page script
(function() {
  const url = new URL(window.location.href);
  const classParam = url.searchParams.get('class') || 'Class';
  const classId = url.searchParams.get('classId') || 'default';
  const timeParam = url.searchParams.get('time') || new Date().toISOString();
  document.getElementById('classTitle').textContent = classParam;
  document.getElementById('markTime').textContent = new Date(timeParam).toLocaleString();

  // i18n: strings
  const STRINGS = {
    en: {
      markedOn: 'Marked on:',
      tabs: { all: 'All', present: 'Present', absent: 'Absent' },
      search: 'Search by name or roll',
      compact: 'Compact',
      comfortable: 'Comfort',
      hdrName: 'Name',
      hdrStatus: 'Status',
      save: 'Save Changes',
      markAll: 'Mark All Present',
      present: 'Present',
      absent: 'Absent'
    },
    hi: {
      markedOn: 'चिन्हित समय:',
      tabs: { all: 'सभी', present: 'उपस्थित', absent: 'अनुपस्थित' },
      search: 'नाम या रोल से खोजें',
      compact: 'कॉम्पैक्ट',
      comfortable: 'कंफर्ट',
      hdrName: 'नाम',
      hdrStatus: 'स्थिति',
      save: 'परिवर्तन सहेजें',
      markAll: 'सभी को उपस्थित करें',
      present: 'उपस्थित',
      absent: 'अनुपस्थित'
    }
  };

  let currentLang = (localStorage.getItem('viewEditLang') || 'en');

  function applyLanguage(lang) {
    const s = STRINGS[lang] || STRINGS.en;
    currentLang = lang;
    localStorage.setItem('viewEditLang', currentLang);

    // header
    const markedOnWrap = document.getElementById('markedOnWrap');
    if (markedOnWrap) markedOnWrap.firstChild.nodeValue = s.markedOn + ' ';
    // tabs
    const tabs = document.querySelectorAll('.tabs .tab');
    if (tabs.length === 3) {
      tabs[0].textContent = s.tabs.all;
      tabs[1].textContent = s.tabs.present;
      tabs[2].textContent = s.tabs.absent;
    }
    // search placeholder
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.placeholder = s.search;
    // density buttons
    const denseCompact = document.getElementById('denseCompact');
    const denseComfort = document.getElementById('denseComfort');
    if (denseCompact) denseCompact.textContent = s.compact;
    if (denseComfort) denseComfort.textContent = s.comfortable;
    // list header
    const hdrName = document.getElementById('hdrName');
    const hdrStatus = document.getElementById('hdrStatus');
    if (hdrName) hdrName.textContent = s.hdrName;
    if (hdrStatus) hdrStatus.textContent = s.hdrStatus;
    // buttons
    const saveBtn = document.getElementById('saveChanges');
    if (saveBtn) saveBtn.textContent = s.save;
    const markAllBtn = document.getElementById('markAllPresent');
    if (markAllBtn) markAllBtn.textContent = s.markAll;

    // Update existing status pills in list
    document.querySelectorAll('.status-pill').forEach(pill => {
      const isPresent = pill.classList.contains('present');
      pill.textContent = isPresent ? s.present : s.absent;
    });
  }

  // Language switch handlers
  document.querySelectorAll('.lang-switch a[data-lang]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.lang-switch a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      applyLanguage(a.getAttribute('data-lang'));
    });
  });

  async function loadLanguage(lang) {
    const res = await fetch(`languages/${lang}.json`);
    const dict = await res.json();

    document.getElementById('classTitle').textContent = dict.class;
    document.getElementById('markedOnWrap').childNodes[0].textContent = dict.marked_on + " ";
    document.getElementById('chipPresent').parentNode.childNodes[0].textContent = dict.present + ": ";
    document.getElementById('chipAbsent').parentNode.childNodes[0].textContent = dict.absent + ": ";
    document.getElementById('chipTotal').parentNode.childNodes[0].textContent = dict.total + ": ";
    document.getElementById('markAllPresent').textContent = dict.mark_all_present;
    document.querySelector('.tab[data-filter="all"]').textContent = dict.all;
    document.querySelector('.tab[data-filter="present"]').textContent = dict.present_tab;
    document.querySelector('.tab[data-filter="absent"]').textContent = dict.absent_tab;
    document.getElementById('search').placeholder = dict.search_placeholder;
    document.getElementById('denseCompact').textContent = dict.compact;
    document.getElementById('denseComfort').textContent = dict.comfortable;
    document.getElementById('hdrName').textContent = dict.name;
    document.getElementById('hdrStatus').textContent = dict.status;
    document.getElementById('saveChanges').textContent = dict.save_changes;
    document.querySelector('.site-footer a').textContent = dict.help_support;
    document.getElementById('presentCount').parentNode.childNodes[0].textContent = dict.present_count + " ";
    document.getElementById('absentCount').parentNode.childNodes[2].textContent = " " + dict.absent_count;
  }

  // Load students based on classId; fallback chain: backend → class JSON → default JSON → mock
  loadStudentsForClass(classId)
    .then(students => initialize(students))
    .catch(() => initialize(makeMockStudents()));

  function loadStudentsForClass(classId) {
    // 1) Try backend endpoint (to be implemented by server)
    const backendUrl = `/api/classes/${encodeURIComponent(classId)}/students`;
    return fetch(backendUrl, { headers: { 'Accept': 'application/json' }})
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (Array.isArray(data)) return data;          // If API returns array directly
        if (Array.isArray(data?.students)) return data.students; // Or { students: [...] }
        return Promise.reject();
      })
      .catch(() => {
        // 2) Try class-specific JSON file, e.g., view-edit-VIII-A.json
        const classJson = `view-edit-${classId}.json`;
        return fetch(classJson)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(j => Array.isArray(j?.students) ? j.students : Promise.reject())
          .catch(() => {
            // 3) Fallback to default demo JSON
            return fetch('view-edit.json')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(j => Array.isArray(j?.students) ? j.students : Promise.reject());
          });
      });
  }

  function makeMockStudents() {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: 'S' + String(i+1).padStart(3,'0'),
      roll: i + 1,
      name: `Student ${i + 1}`,
      photo: `https://i.pravatar.cc/100?img=${(i%70)+1}`,
      present: Math.random() > 0.15
    }));
  }

  function initialize(students) {
    const state = { students: students || [], filter: 'all', density: 'compact' };
    const listEl = document.getElementById('studentList');
    const presentCountEl = document.getElementById('presentCount');
    const absentCountEl = document.getElementById('absentCount');
    const chipPresentEl = document.getElementById('chipPresent');
    const chipAbsentEl = document.getElementById('chipAbsent');
    const chipTotalEl = document.getElementById('chipTotal');
    const searchEl = document.getElementById('search');
    const listShell = document.getElementById('listShell');

    function updateCounts() {
      const present = state.students.filter(s => s.present).length;
      const absent = state.students.length - present;
      presentCountEl.textContent = present;
      absentCountEl.textContent = absent;
      if (chipPresentEl) chipPresentEl.textContent = present;
      if (chipAbsentEl) chipAbsentEl.textContent = absent;
      if (chipTotalEl) chipTotalEl.textContent = state.students.length;
    }

    function renderList() {
      const q = searchEl.value.trim().toLowerCase();
      let filtered = state.students.filter(s => {
        if (!q) return true;
        return String(s.roll).includes(q) || s.name.toLowerCase().includes(q);
      });
      if (state.filter === 'present') filtered = filtered.filter(s => s.present);
      if (state.filter === 'absent') filtered = filtered.filter(s => !s.present);
      listEl.innerHTML = '';
      filtered.forEach(s => {
        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
          <img class="student-pic" src="${s.photo}" alt="${s.name}">
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-roll">Roll ${s.roll} • ${s.id}</div>
          </div>
          <div class="status-toggle">
            <span class="status-pill ${s.present ? 'present' : 'absent'}">${s.present ? 'Present' : 'Absent'}</span>
            <label class="switch">
              <input type="checkbox" ${s.present ? 'checked' : ''} data-id="${s.id}">
              <span class="slider"></span>
            </label>
          </div>
        `;
        const checkbox = row.querySelector('input[type="checkbox"]');
        const pill = row.querySelector('.status-pill');
        checkbox.addEventListener('change', (e) => {
          s.present = e.target.checked;
          const sTr = STRINGS[currentLang] || STRINGS.en;
          pill.textContent = s.present ? sTr.present : sTr.absent;
          pill.className = 'status-pill ' + (s.present ? 'present' : 'absent');
          updateCounts();
        });
        listEl.appendChild(row);
      });
      updateCounts();
    }

    document.getElementById('markAllPresent').addEventListener('click', () => {
      state.students.forEach(s => s.present = true);
      renderList();
    });

    document.getElementById('saveChanges').addEventListener('click', () => {
      // Placeholder: simulate saving
      alert('Attendance updated for ' + classParam + '\nPresent: ' + state.students.filter(s=>s.present).length + '\nAbsent: ' + state.students.filter(s=>!s.present).length);
    });

    searchEl.addEventListener('input', renderList);
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filter = tab.getAttribute('data-filter');
        renderList();
      });
    });
    // Density
    function applyDensity() {
      if (state.density === 'compact') listShell.classList.add('compact');
      else listShell.classList.remove('compact');
    }
    const denseCompact = document.getElementById('denseCompact');
    const denseComfort = document.getElementById('denseComfort');
    if (denseCompact && denseComfort) {
      denseCompact.addEventListener('click', () => {
        state.density = 'compact';
        denseCompact.classList.add('active');
        denseComfort.classList.remove('active');
        applyDensity();
      });
      denseComfort.addEventListener('click', () => {
        state.density = 'comfortable';
        denseComfort.classList.add('active');
        denseCompact.classList.remove('active');
        applyDensity();
      });
    }

    applyDensity();
    renderList();
    // Apply persisted language
    applyLanguage(currentLang);
  }
})();


