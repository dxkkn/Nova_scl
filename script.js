// --- Data Jadwal Pelajaran ---
        const scheduleData = {
            1: [ // Senin
                { start: "07:40", end: "09:00", subject: "Koding", teacher: "Pak Aan" },
                { start: "09:20", end: "10:40", subject: "Pendidikan Pancasila", teacher: "Bu Elvi" },
                { start: "10:40", end: "12:00", subject: "Bahasa Inggris", teacher: "Bu Dwi" },
                { start: "12:30", end: "13:50", subject: "Sejarah", teacher: "Bu Yani" }
            ],
            2: [ // Selasa
                { start: "07:00", end: "09:00", subject: "Perkembangan Teknologi Bidang Teknik Jaringan", teacher: "Bu Iis" },
                { start: "09:20", end: "10:40", subject: "Proses Bisnis di Bidang TJKT", teacher: "Pak Fandi" },
                { start: "10:40", end: "12:00", subject: "Matematika", teacher: "Bu In In" },
                { start: "12:30", end: "13:50", subject: "Bahasa Jawa", teacher: "Bu Elvi" }
            ],
            3: [ // Rabu
                { start: "07:00", end: "08:20", subject: "Bahasa Indonesia", teacher: "Pak Slamet" },
                { start: "08:20", end: "10:00", subject: "Bahasa Inggris", teacher: "Bu Dwi" },
                { start: "10:00", end: "11:20", subject: "Proyek IPAS", teacher: "Bu Andin" },
                { start: "11:20", end: "12:00", subject: "Bahasa Indonesia", teacher: "Pak Slamet" },
                { start: "12:30", end: "13:50", subject: "Seni Budaya", teacher: "Bu Dewi" }
            ],
            4: [ // Kamis
                { start: "07:00", end: "10:00", subject: "Informatika", teacher: "Pak Taufik" },
                { start: "10:00", end: "12:00", subject: "PAI", teacher: "Bu Iis" },
                { start: "12:30", end: "13:50", subject: "Profesi & Kewirausahaan di TJKT", teacher: "Bu Khatun" }
            ],
            5: [ // Jumat
                { start: "07:40", end: "09:00", subject: "Kecakapan Kerja Dasar", teacher: "Bu Fita" },
                { start: "09:20", end: "10:40", subject: "Matematika", teacher: "Bu In In" },
                { start: "10:40", end: "11:20", subject: "Bahasa Indonesia", teacher: "Pak Slamet" }
            ],
            6: [ // Sabtu
                { start: "07:40", end: "10:00", subject: "Pendidikan Jasmani, Olahraga", teacher: "Arif Wibowo" },
                { start: "10:00", end: "11:20", subject: "Proses Bisnis di Bidang TJKT", teacher: "Pak Fandi" },
                { start: "11:20", end: "13:00", subject: "Proyek IPAS", teacher: "Bu Andin" }
            ],
            0: [] // Minggu
        };

        const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const monthsIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        
        let selectedDayTab = new Date().getDay();
        // If Sunday, default to Monday
        if (selectedDayTab === 0) selectedDayTab = 1;

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // --- Utility Functions ---
        
        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        }

        function getCurrentTimeStr() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        }

        function getGreeting(hour) {
            if (hour >= 5 && hour < 11) return "Selamat pagi";
            if (hour >= 11 && hour < 15) return "Selamat siang";
            if (hour >= 15 && hour < 18) return "Selamat sore";
            return "Selamat malam";
        }

        // --- Core Application Logic ---

        function checkLogin() {
            const studentName = localStorage.getItem('studentName');
            const studentClass = localStorage.getItem('studentClass');
            const modal = document.getElementById('loginModal');

            if (!studentName || !studentClass) {
                modal.classList.remove('hidden');
            } else {
                modal.classList.add('hidden');
                updateGreeting(studentName, studentClass);
                populateTaskSubjectDropdown();
                renderTasks();
            }
        }

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('inputName').value.trim();
            const cls = document.getElementById('inputClass').value.trim();
            
            if (name && cls) {
                localStorage.setItem('studentName', name);
                localStorage.setItem('studentClass', cls);
                checkLogin();
            }
        });

        function updateGreeting(name, cls) {
            const hour = new Date().getHours();
            const greeting = getGreeting(hour);
            document.getElementById('greetingText').innerHTML = `${greeting}, ${name} <span class="text-3xl">👋</span>`;
            document.getElementById('classNameDisplay').textContent = `Kelas: ${cls}`;
        }

        function updateClockAndSchedule() {
            const now = new Date();
            
            // Update Date Display
            const dayName = daysIndo[now.getDay()];
            const date = now.getDate();
            const monthName = monthsIndo[now.getMonth()];
            const year = now.getFullYear();
            document.getElementById('currentDateDisplay').textContent = `${dayName}, ${date} ${monthName} ${year}`;

            // Real-time schedule logic
            const currentDayIndex = now.getDay();
            const currentTimeStr = getCurrentTimeStr();
            const currentMins = timeToMinutes(currentTimeStr);
            
            const todaySchedule = scheduleData[currentDayIndex] || [];
            
            let currentClass = null;
            let nextClass = null;
            
            // Find current and next
            for (let i = 0; i < todaySchedule.length; i++) {
                const cls = todaySchedule[i];
                const startMins = timeToMinutes(cls.start.replace('.', ':')); // handle both 07:40 and 07.40 formats if any
                const endMins = timeToMinutes(cls.end.replace('.', ':'));

                if (currentMins >= startMins && currentMins < endMins) {
                    currentClass = cls;
                    if (i + 1 < todaySchedule.length) {
                        nextClass = todaySchedule[i + 1];
                    }
                    break;
                } else if (currentMins < startMins) {
                    if (!currentClass) {
                        nextClass = cls;
                    }
                    break;
                }
            }

            updateCurrentClassUI(currentClass, currentMins);
            updateNextClassUI(nextClass);
        }

        function updateCurrentClassUI(currentClass, currentMins) {
            const subjEl = document.getElementById('currentSubject');
            const teacherEl = document.getElementById('currentTeacher');
            const timeEl = document.getElementById('currentTimeRange');
            const progressEl = document.getElementById('progressBar');
            const progressTextEl = document.getElementById('progressText');
            const badgeEl = document.getElementById('statusBadge');

            if (currentClass) {
                subjEl.textContent = currentClass.subject;
                teacherEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-blue-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> <span>${currentClass.teacher}</span>`;
                timeEl.textContent = `${currentClass.start} – ${currentClass.end}`;
                
                // Calculate progress
                const startMins = timeToMinutes(currentClass.start.replace('.', ':'));
                const endMins = timeToMinutes(currentClass.end.replace('.', ':'));
                const totalDuration = endMins - startMins;
                const elapsed = currentMins - startMins;
                let percentage = Math.floor((elapsed / totalDuration) * 100);
                
                // clamp
                if (percentage < 0) percentage = 0;
                if (percentage > 100) percentage = 100;

                progressEl.style.width = `${percentage}%`;
                progressTextEl.textContent = `${percentage}%`;
                
                badgeEl.innerHTML = `<div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> berlangsung`;
                badgeEl.className = "bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5";
            } else {
                subjEl.textContent = "Istirahat / Luar Jam Pelajaran";
                teacherEl.innerHTML = `<span>Waktunya bersantai atau belajar mandiri</span>`;
                timeEl.textContent = "-";
                progressEl.style.width = `0%`;
                progressTextEl.textContent = `0%`;
                
                badgeEl.innerHTML = `jeda`;
                badgeEl.className = "bg-slate-500/20 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-500/20 flex items-center gap-1.5";
            }
        }

        function updateNextClassUI(nextClass) {
            if (nextClass) {
                document.getElementById('nextTimeRange').textContent = `${nextClass.start} – ${nextClass.end}`;
                document.getElementById('nextSubject').textContent = nextClass.subject;
                document.getElementById('nextTeacher').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> <span>${nextClass.teacher}</span>`;
            } else {
                document.getElementById('nextTimeRange').textContent = "-";
                document.getElementById('nextSubject').textContent = "Tidak ada pelajaran selanjutnya hari ini";
                document.getElementById('nextTeacher').innerHTML = "";
            }
        }

        function renderWeeklySchedule() {
            const tabs = document.querySelectorAll('.day-tab');
            tabs.forEach(tab => {
                if (parseInt(tab.dataset.day) === selectedDayTab) {
                    tab.classList.add('active-tab');
                    tab.classList.remove('text-slate-400');
                } else {
                    tab.classList.remove('active-tab');
                    tab.classList.add('text-slate-400');
                }
            });

            const listContainer = document.getElementById('scheduleList');
            listContainer.innerHTML = '';

            const daySchedule = scheduleData[selectedDayTab] || [];
            
            if (daySchedule.length === 0) {
                listContainer.innerHTML = `<div class="text-center p-6 text-slate-500 glass-panel rounded-2xl">Tidak ada jadwal untuk hari ini.</div>`;
                return;
            }

            const now = new Date();
            const currentDayIndex = now.getDay();
            const currentMins = timeToMinutes(getCurrentTimeStr());

            daySchedule.forEach(cls => {
                const startMins = timeToMinutes(cls.start.replace('.', ':'));
                const endMins = timeToMinutes(cls.end.replace('.', ':'));
                
                let isCurrent = false;
                if (selectedDayTab === currentDayIndex && currentMins >= startMins && currentMins < endMins) {
                    isCurrent = true;
                }

                const itemHTML = `
                    <div class="glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all ${isCurrent ? 'active-class-border shadow-lg' : 'border border-slate-700/40'}">
                        <div class="w-24 flex-shrink-0 text-sm font-semibold font-mono ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}">
                            ${cls.start} – ${cls.end}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-base font-bold text-slate-200 truncate ${isCurrent ? 'text-white' : ''}">${cls.subject}</h4>
                            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                ${cls.teacher}
                            </p>
                        </div>
                    </div>
                `;
                listContainer.innerHTML += itemHTML;
            });
        }

        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                selectedDayTab = parseInt(e.target.dataset.day);
                renderWeeklySchedule();
            });
        });

        function populateTaskSubjectDropdown() {
            const select = document.getElementById('taskSubject');
            select.innerHTML = '<option value="">Pilih mata pelajaran...</option>';
            
            // Get unique subjects
            const uniqueSubjects = new Set();
            for (let day in scheduleData) {
                scheduleData[day].forEach(cls => uniqueSubjects.add(cls.subject));
            }
            
            [...uniqueSubjects].sort().forEach(subj => {
                const opt = document.createElement('option');
                opt.value = subj;
                opt.textContent = subj;
                // adjust background for options as native selects can be ugly
                opt.style.background = "#0f172a"; 
                select.appendChild(opt);
            });
        }

        function renderTasks() {
            const taskList = document.getElementById('taskList');
            const emptyMsg = document.getElementById('emptyTaskMsg');
            const taskCountEl = document.getElementById('taskCount');
            
            taskList.innerHTML = '';
            
            if (tasks.length === 0) {
                emptyMsg.style.display = 'block';
                taskCountEl.textContent = '0/0';
                return;
            }
            
            emptyMsg.style.display = 'none';
            let completed = 0;

            tasks.forEach((task, index) => {
                if(task.done) completed++;
                
                taskList.innerHTML += `
                    <div class="glass-panel p-3 rounded-xl border border-slate-700/50 flex justify-between items-center gap-3">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})" class="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-600 bg-slate-800">
                            <div class="flex-1 min-w-0">
                                <div class="text-xs font-semibold text-indigo-400 mb-0.5 truncate">${task.subject}</div>
                                <div class="text-sm ${task.done ? 'line-through text-slate-500' : 'text-slate-200'} truncate">${task.desc}</div>
                            </div>
                        </div>
                        <button onclick="deleteTask(${index})" class="text-slate-500 hover:text-red-400 transition-colors p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            });
            
            taskCountEl.textContent = `${completed}/${tasks.length}`;
        }

        function addTask() {
            const subj = document.getElementById('taskSubject').value;
            const desc = document.getElementById('taskDesc').value.trim();
            
            if (subj && desc) {
                tasks.push({ subject: subj, desc: desc, done: false });
                localStorage.setItem('tasks', JSON.stringify(tasks));
                document.getElementById('taskDesc').value = '';
                document.getElementById('taskSubject').value = '';
                renderTasks();
            }
        }

        function toggleTask(index) {
            tasks[index].done = !tasks[index].done;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }

        function deleteTask(index) {
            tasks.splice(index, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }

        // Action Buttons
        function scrollToWeekly() {
            document.getElementById('weeklySection').scrollIntoView({ behavior: 'smooth' });
            // Select today automatically when clicking 'Hari ini'
            const today = new Date().getDay();
            selectedDayTab = (today === 0) ? 1 : today;
            renderWeeklySchedule();
        }

        function scrollToTasks() {
            document.getElementById('tasksSection').scrollIntoView({ behavior: 'smooth' });
        }

        function copySchedule() {
            const today = new Date().getDay();
            const idx = today === 0 ? 1 : today;
            const daySchedule = scheduleData[idx] || [];
            
            if (daySchedule.length === 0) return;

            let text = `*Jadwal Hari ${daysIndo[idx]}*\n\n`;
            daySchedule.forEach(c => {
                text += `⏰ ${c.start} - ${c.end}\n📚 ${c.subject}\n👤 ${c.teacher}\n\n`;
            });
            
            text += `_Disalin dari NOVA School OS_`;

            // Use legacy execCommand for iframe compatibility as requested
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                // Create a temporary toast
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-sm border border-slate-700 z-50';
                toast.textContent = 'Jadwal disalin!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
            document.body.removeChild(textArea);
        }

        // Settings modal
        function openSettings() {
            document.getElementById('inputDriveLink').value = localStorage.getItem('driveLink') || '';
            document.getElementById('settingsModal').classList.remove('hidden');
        }

        function closeSettings() {
            document.getElementById('settingsModal').classList.add('hidden');
        }

        function saveSettings() {
            const link = document.getElementById('inputDriveLink').value;
            localStorage.setItem('driveLink', link);
            closeSettings();
        }

        function openDrive() {
            const link = localStorage.getItem('driveLink');
            if (link && link.startsWith('http')) {
                window.open(link, '_blank');
            } else {
                openSettings();
                // small visual cue
                document.getElementById('inputDriveLink').classList.add('ring-2', 'ring-red-500');
                setTimeout(() => document.getElementById('inputDriveLink').classList.remove('ring-2', 'ring-red-500'), 1000);
            }
        }

        function init() {
            checkLogin();
            updateClockAndSchedule();
            renderWeeklySchedule();
            
            // Update time/schedule every second
            setInterval(updateClockAndSchedule, 1000);
            
            // Re-render weekly if day changes while app is open (edge case, check every hour)
            setInterval(() => {
                const currentDayIndex = new Date().getDay();
                // Optionally auto-switch tab to today if they haven't explicitly clicked away
                renderWeeklySchedule();
            }, 60000 * 60);
        }

        // Start app
        init();
