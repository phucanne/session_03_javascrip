    function showMessage(msg, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.background = isError ? '#dc2626' : '#1e293b';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    let students = [];
    let editingStudentIndex = null;
    function loadStudents() {
        const stored = localStorage.getItem('students_btth03');
        if (stored) {
            students = JSON.parse(stored);
        } else {
            students = [];
        }
    }

    function saveStudents() {
        localStorage.setItem('students_btth03', JSON.stringify(students));
    }
    function renderStudents() {
        const tbody = document.getElementById('studentTbody');
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-row"> Chưa có dữ liệu sinh viên</td></tr>';
            updateStudentStats();
            return;
        }
        let html = '';
        students.forEach((student, index) => {
            html += `
                <tr>
                    <td>${escapeHtml(student.id)}</td>
                    <td>${escapeHtml(student.name)}</td>
                    <td>${escapeHtml(student.dob)}</td>
                    <td>${escapeHtml(student.class)}</td>
                    <td>${student.gpa}</td>
                    <td>${escapeHtml(student.email)}</td>
                    <td>
                        <button class="btn btn-warning btn-edit-student" data-index="${index}" style="padding:5px 10px; margin-right:5px;">Sửa</button>
                        <button class="btn btn-danger btn-delete-student" data-index="${index}" style="padding:5px 10px;">Xóa</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        document.querySelectorAll('.btn-edit-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                openEditStudentModal(idx);
            });
        });
        document.querySelectorAll('.btn-delete-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                confirmDeleteStudent(idx);
            });
        });
        updateStudentStats();
    }
    function updateStudentStats() {
        const total = students.length;
        let avg = 0;
        if (total > 0) {
            const sum = students.reduce((acc, s) => acc + parseFloat(s.gpa), 0);
            avg = sum / total;
        }
        document.getElementById('totalStudents').innerText = total;
        document.getElementById('avgScore').innerText = avg.toFixed(2);
    }
    function openAddStudentModal() {
        editingStudentIndex = null;
        document.getElementById('studentModalTitle').innerText = 'Thêm sinh viên';
        document.getElementById('studentForm').reset();
        document.getElementById('studentModal').style.display = 'flex';
    }

    // Mở modal sửa sinh viên
    function openEditStudentModal(index) {
        const student = students[index];
        if (!student) return;
        editingStudentIndex = index;
        document.getElementById('studentModalTitle').innerText = 'Sửa sinh viên';
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentDob').value = student.dob;
        document.getElementById('studentClass').value = student.class;
        document.getElementById('studentGpa').value = student.gpa;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentModal').style.display = 'flex';
    }

    // Xác nhận xóa sinh viên
    function confirmDeleteStudent(index) {
        if (confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
            students.splice(index, 1);
            saveStudents();
            renderStudents();
            showMessage('Đã xóa sinh viên thành công!');
        }
    }
    function handleStudentSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('studentId').value.trim();
        const name = document.getElementById('studentName').value.trim();
        const dob = document.getElementById('studentDob').value;
        const className = document.getElementById('studentClass').value.trim();
        const gpa = parseFloat(document.getElementById('studentGpa').value);
        const email = document.getElementById('studentEmail').value.trim();
        if (!id || !name || !dob || !className || isNaN(gpa) || !email) {
            showMessage('Vui lòng điền đầy đủ thông tin!', true);
            return;
        }
        if (gpa < 0 || gpa > 10) {
            showMessage('Điểm trung bình phải từ 0 đến 10!', true);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Email không hợp lệ!', true);
            return;
        }

        if (editingStudentIndex === null) {
            // Thêm mới
            if (students.some(s => s.id === id)) {
                showMessage('Mã sinh viên đã tồn tại!', true);
                return;
            }
            const newStudent = { id, name, dob, class: className, gpa, email };
            students.push(newStudent);
            showMessage('Thêm sinh viên thành công!');
        } else {
            students[editingStudentIndex] = { id, name, dob, class: className, gpa, email };
            showMessage('Cập nhật sinh viên thành công!');
        }
        saveStudents();
        renderStudents();
        document.getElementById('studentModal').style.display = 'none';
        editingStudentIndex = null;
    }
    let tasks = [];
    let editingTaskIndex = null;
    function loadTasks() {
        const stored = localStorage.getItem('tasks_btth03');
        if (stored) {
            tasks = JSON.parse(stored);
        } else {
            tasks = [];
        }
    }
    function saveTasks() {
        localStorage.setItem('tasks_btth03', JSON.stringify(tasks));
    }
    function renderTasks() {
        const container = document.getElementById('taskList');
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-row">Chưa có công việc nào. Hãy thêm mới!</div>';
            updateTaskStats();
            return;
        }
        let html = '';
        tasks.forEach((task, index) => {
            const completedClass = task.completed ? 'completed' : '';
            let priorityClass = '';
            if (task.priority === 'Cao') priorityClass = 'priority-high';
            else if (task.priority === 'Trung bình') priorityClass = 'priority-medium';
            else priorityClass = 'priority-low';
            html += `
                <div class="task-card ${completedClass}">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span>${task.description ? escapeHtml(task.description) : 'Không có mô tả'}</span>
                        <span>Hạn: ${task.dueDate || 'Chưa đặt'}</span>
                        <span class="${priorityClass}">Ưu tiên: ${task.priority}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-success btn-toggle-task" data-index="${index}">${task.completed ? 'Chưa hoàn thành' : 'Hoàn thành'}</button>
                        <button class="btn btn-warning btn-edit-task" data-index="${index}">Sửa</button>
                        <button class="btn btn-danger btn-delete-task" data-index="${index}">Xóa</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        document.querySelectorAll('.btn-toggle-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                toggleTaskStatus(idx);
            });
        });
        document.querySelectorAll('.btn-edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                openEditTaskModal(idx);
            });
        });
        document.querySelectorAll('.btn-delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                confirmDeleteTask(idx);
            });
        });
        updateTaskStats();
    }
    function updateTaskStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed === true).length;
        const pending = total - completed;
        document.getElementById('totalTasks').innerText = total;
        document.getElementById('completedTasks').innerText = completed;
        document.getElementById('pendingTasks').innerText = pending;
    }
    function toggleTaskStatus(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
        showMessage(tasks[index].completed ? 'Đã hoàn thành công việc!' : 'Chuyển sang chưa hoàn thành');
    }
    function openAddTaskModal() {
        editingTaskIndex = null;
        document.getElementById('taskModalTitle').innerText = 'Thêm công việc';
        document.getElementById('taskForm').reset();
        document.getElementById('taskModal').style.display = 'flex';
    }
    function openEditTaskModal(index) {
        const task = tasks[index];
        if (!task) return;
        editingTaskIndex = index;
        document.getElementById('taskModalTitle').innerText = 'Sửa công việc';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDesc').value = task.description || '';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskPriority').value = task.priority || 'Trung bình';
        document.getElementById('taskModal').style.display = 'flex';
    }
    function confirmDeleteTask(index) {
        if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            showMessage('Đã xóa công việc!');
        }
    }
    function handleTaskSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDesc').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title) {
            showMessage('Tiêu đề công việc không được để trống!', true);
            return;
        }
        if (editingTaskIndex === null) {
            const newTask = {
                id: Date.now(),
                title,
                description,
                dueDate,
                priority,
                completed: false
            };
            tasks.push(newTask);
            showMessage('Thêm công việc thành công!');
        } else {
            tasks[editingTaskIndex] = {
                ...tasks[editingTaskIndex],
                title,
                description,
                dueDate,
                priority
            };
            showMessage('Cập nhật công việc thành công!');
        }
        saveTasks();
        renderTasks();
        document.getElementById('taskModal').style.display = 'none';
        editingTaskIndex = null;
    }
    function init() {
        loadStudents();
        loadTasks();
        renderStudents();
        renderTasks();
        document.getElementById('btnOpenStudentModal').addEventListener('click', openAddStudentModal);
        document.getElementById('btnCloseStudentModal').addEventListener('click', () => {
            document.getElementById('studentModal').style.display = 'none';
            editingStudentIndex = null;
        });
        document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
        document.getElementById('btnOpenTaskModal').addEventListener('click', openAddTaskModal);
        document.getElementById('btnCloseTaskModal').addEventListener('click', () => {
            document.getElementById('taskModal').style.display = 'none';
            editingTaskIndex = null;
        });
        document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                editingStudentIndex = null;
                editingTaskIndex = null;
            }
        });
    }
    init();