$(document).ready(function () {
    TaskList();
});

function showToast(message, type) {
    const toastContainer = document.querySelector('.toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`;
    toastContainer.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
}

function SaveTask() {
    let TaskTitle = $("#inputTaskTitle").val().trim();

    if (TaskTitle == '') {
        alert('Please enter a Task Title.');
        return;
    }

    let Priority = $("#inputPriority").val();
    let Description = $("#inputDescription").val().trim();
    let StartDate = $("#inputStartDate").val();
    let DueDate = $("#inputDueDate").val();

    if (StartDate == '') {
        alert('Please select a Start Date.');
        return;
    }
    if (DueDate == '') {
        alert('Please select a Due Date.');
        return;
    }

    let TaskDetails = {
        tasktitle: TaskTitle,
        priority: Priority,
        description: Description == '' ? '-' : Description,
        startdate: StartDate,
        duedate: DueDate
    };

    $.ajax({
        type: "POST",
        url: "/Home/SaveTask",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(TaskDetails),
        dataType: "json",
        async: true,
        cache: false,
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            if (response.success) {
                setTimeout(function () { window.location.reload(true); }, 3000);
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function TaskList() {
    $.ajax({
        type: "GET",
        url: "/Home/GetTaskList",
        dataType: "json",
        async: true,
        cache: false,
        success: function (data) {
            if (data != null && data.GetList != null && data.GetList.length > 0) {
                $("#taskTableBody").empty();
                let counter = 1;
                data.GetList.forEach(function (task) {

                    function formatDate(dateStr) {
                        let timestamp = parseInt(dateStr.replace('/Date(', '').replace(')/', ''));
                        let date = new Date(timestamp);
                        return date.toLocaleDateString('en-GB');
                    }

                    let priorityClass = task.priority === 'High' ? 'priority-high' : task.priority === 'Medium' ? 'priority-medium' : 'priority-low';
                    let priorityIcon = task.priority === 'High' ? 'fa-circle-exclamation' : task.priority === 'Medium' ? 'fa-circle-minus' : 'fa-circle-check';

                    let TaskDetail = `<tr>` +
                        `<td class='text-center'>` + counter + `</td>` +
                        `<td class='text-center' style='font-weight:600;color:#0f172a;'>` + task.tasktitle + `</td>` +
                        `<td class='text-center'><span class='priority-badge ${priorityClass}'><i class='fa-solid ${priorityIcon}'></i>${task.priority}</span></td>` +
                        `<td class='text-center' style='max-width:280px;color:#64748b;font-size:13px;'>` + task.description + `</td>` +
                        `<td class='text-center' style='font-weight:500;color:#475569;'>` + formatDate(task.startdate) + `</td>` +
                        `<td class='text-center' style='font-weight:500;color:#475569;'>` + formatDate(task.duedate) + `</td>` +
                        `<td class='text-center'>
        <div style='display:flex;flex-direction:column;align-items:center;gap:5px;'>
            <div style='display:flex;gap:5px;'>
                <button type='button' class='btn btn-success btn-sm' style='padding:2px 7px;border-radius:50%;' onclick='OpenSubTask(` + task.taskid + `)' title='Add Subtask'>
                    <i class='fa-solid fa-plus' style='font-size:11px;'></i>
                </button>
                <div style='position:relative;display:inline-block;'>
                    <button type='button' class='btn btn-info btn-sm' style='padding:2px 7px;border-radius:50%;' onclick='ToggleViewSubTask(` + task.taskid + `, this)' title='View Subtasks'>
                        <i class='fa-solid fa-eye' style='font-size:11px;'></i>
                    </button>
                    <div class='view-subtask-dropdown' id='viewDropdown_` + task.taskid + `'></div>
                </div>
            </div>
            <div style='display:flex;gap:5px;'>
                <button type='button' class='btn btn-info btn-sm' onclick='EditTask(` + task.taskid + `)'>
                    <i class='fa-solid fa-pen-to-square'></i>
                </button>
                <button type='button' class='btn btn-danger btn-sm' onclick='DeleteTask(` + task.taskid + `)'>
                    <i class='fa-solid fa-trash'></i>
                </button>
            </div>
        </div>
    </td>` +
                        `</tr>`;

                    $("#taskTableBody").append(TaskDetail);
                    counter++;
                });

                if (!$.fn.DataTable.isDataTable('#taskTable')) {
                    $('#taskTable').DataTable();
                }
            } else {
                showToast("No Data Available", 'info');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function EditTask(taskid) {
    $.ajax({
        type: "GET",
        url: "/Home/GetTaskById?taskid=" + taskid,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                $("#editTaskId").val(data.taskid);
                $("#editTaskTitle").val(data.tasktitle);
                $("#editPriority").val(data.priority);
                $("#editDescription").val(data.description);

                let startDate = new Date(parseInt(data.startdate.replace('/Date(', '').replace(')/', '')));
                let dueDate = new Date(parseInt(data.duedate.replace('/Date(', '').replace(')/', '')));

                $("#editStartDate").val(startDate.toISOString().split('T')[0]);
                $("#editDueDate").val(dueDate.toISOString().split('T')[0]);

                $('#editModal').modal('show');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function UpdateTask() {
    let TaskDetails = {
        taskid: $("#editTaskId").val(),
        tasktitle: $("#editTaskTitle").val(),
        priority: $("#editPriority").val(),
        description: $("#editDescription").val(),
        startdate: $("#editStartDate").val(),
        duedate: $("#editDueDate").val()
    };
    $.ajax({
        type: "POST",
        url: "/Home/UpdateTask",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(TaskDetails),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#editModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function DeleteTask(taskid) {
    $("#deleteTaskId").val(taskid);
    $('#deleteModal').modal('show');
}

function ConfirmDelete() {
    let taskid = $("#deleteTaskId").val();
    $.ajax({
        type: "POST",
        url: "/Home/DeleteTask",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ taskid: taskid }),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#deleteModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

// SUBTASK FUNCTIONS
function OpenSubTask(taskid) {
    $("#subtaskTaskId").val(taskid);
    $("#inputSubTask").val('');
    LoadSubTasks(taskid);
    $('#subtaskModal').modal('show');
}

function LoadSubTasks(taskid) {
    $.ajax({
        type: "GET",
        url: "/Home/GetSubTasks?taskid=" + taskid,
        dataType: "json",
        success: function (data) {
            $("#subtaskList").empty();
            if (data != null && data.length > 0) {
                data.forEach(function (subtask) {
                    $("#subtaskList").append(`
                        <div class='subtask-item' id='subtask_${subtask.subtaskid}'>
                            <span class='subtask-item-title'>
                                <i class='fa-solid fa-circle-dot' style='color:#2563eb;margin-right:6px;font-size:11px;'></i>
                                ${subtask.subtasktitle}
                            </span>
                            <button class='subtask-delete-btn' onclick='DeleteSubTask(${subtask.subtaskid})'>
                                <i class='fa-solid fa-xmark'></i>
                            </button>
                        </div>
                    `);
                });
            } else {
                $("#subtaskList").html("<div class='subtask-empty'>No subtasks yet. Add one above!</div>");
            }
        },
        error: function () { }
    });
}

function AddSubTask() {
    let taskid = $("#subtaskTaskId").val();
    let subtasktitle = $("#inputSubTask").val().trim();

    if (subtasktitle == '') {
        alert('Please enter a subtask title.');
        return;
    }

    $.ajax({
        type: "POST",
        url: "/Home/SaveSubTask",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ taskid: taskid, subtasktitle: subtasktitle }),
        dataType: "json",
        success: function (response) {
            if (response.success) {
                $("#inputSubTask").val('');
                LoadSubTasks(taskid);
            } else {
                alert(response.message);
            }
        },
        error: function () { alert("Error saving subtask."); }
    });
}

function DeleteSubTask(subtaskid) {
    let taskid = $("#subtaskTaskId").val();
    $.ajax({
        type: "POST",
        url: "/Home/DeleteSubTask",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ subtaskid: subtaskid }),
        dataType: "json",
        success: function (response) {
            if (response.success) {
                LoadSubTasks(taskid);
            }
        },
        error: function () { alert("Error deleting subtask."); }
    });
}

function ToggleViewSubTask(taskid, btn) {
    let dropdown = document.getElementById('viewDropdown_' + taskid);

    document.querySelectorAll('.view-subtask-dropdown').forEach(function (d) {
        if (d !== dropdown) d.classList.remove('show');
    });

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        return;
    }

    dropdown.innerHTML = '<div class="view-subtask-empty">Loading...</div>';
    dropdown.classList.add('show');

    $.ajax({
        type: "GET",
        url: "/Home/GetSubTasks?taskid=" + taskid,
        dataType: "json",
        success: function (data) {
            dropdown.innerHTML = '';
            if (data != null && data.length > 0) {
                data.forEach(function (subtask) {
                    let item = document.createElement('div');
                    item.className = 'view-subtask-item';
                    item.innerHTML = '<i class="fa-solid fa-circle-dot" style="color:#2563eb;margin-right:6px;font-size:11px;"></i>' + subtask.subtasktitle;
                    dropdown.appendChild(item);
                });
            } else {
                dropdown.innerHTML = '<div class="view-subtask-empty">No subtasks found.</div>';
            }
        },
        error: function () {
            dropdown.innerHTML = '<div class="view-subtask-empty">Error loading subtasks.</div>';
        }
    });
}

// Close dropdown when clicking outside
$(document).click(function (e) {
    if (!$(e.target).closest('.view-subtask-dropdown, .btn').length) {
        $('.view-subtask-dropdown').removeClass('show');
    }
});

function WriteWithAI() {
    let title = $("#inputTaskTitle").val().trim();

    if (title == '') {
        alert('Please enter a Task Title first.');
        return;
    }

    $("#aiGenerating").show();
    $("#inputDescription").val('');

    // Simulate AI thinking delay
    setTimeout(function () {
        let description = generateDescription(title);
        $("#inputDescription").val(description);
        $("#aiGenerating").hide();
    }, 1000);
}

function generateDescription(title) {
    let t = title.toLowerCase();

    // LOGIN / AUTH
    if (t.includes('login') || t.includes('sign in') || t.includes('signin')) {
        return 'Design and develop the ' + title + ' with username/email and password fields, input validation and secure authentication.\nImplement error handling, session management and redirect to dashboard on successful login.';
    }
    if (t.includes('signup') || t.includes('sign up') || t.includes('register') || t.includes('registration')) {
        return 'Build the ' + title + ' with form fields for full name, username, email, password and phone number with validation.\nImplement terms and conditions checkbox, password confirmation and success redirect to login page.';
    }
    if (t.includes('logout')) {
        return 'Implement the ' + title + ' functionality to clear user session and redirect to the login page securely.\nEnsure all session data is cleared and unauthorized access is prevented after logout.';
    }
    if (t.includes('forgot password') || t.includes('reset password')) {
        return 'Develop the ' + title + ' feature allowing users to reset their password via email verification.\nImplement secure token generation, email sending and password update functionality.';
    }

    // DASHBOARD
    if (t.includes('dashboard')) {
        return 'Create the ' + title + ' with summary cards showing total, pending, completed and overdue tasks.\nInclude charts for task progress status, priority breakdown and employee task load with real-time data.';
    }

    // TASK
    if (t.includes('task creation') || t.includes('create task') || t.includes('add task')) {
        return 'Build the ' + title + ' module with a form to add task title, priority, description, start date and due date.\nImplement edit, delete and subtask features with DataTable grid for displaying all tasks.';
    }
    if (t.includes('task assign') || t.includes('assign task')) {
        return 'Develop the ' + title + ' feature to assign tasks to employees with employee and task dropdowns.\nDisplay assigned tasks in a grid with assigned date and delete functionality.';
    }
    if (t.includes('task progress') || t.includes('progress')) {
        return 'Implement the ' + title + ' module to update task status as Pending, In Progress or Completed.\nAuto-set progress percentage based on status and display progress with remarks in a grid.';
    }
    if (t.includes('subtask')) {
        return 'Create the ' + title + ' feature allowing users to add multiple subtasks under a main task.\nImplement add and delete subtask functionality with a modal popup and view subtask dropdown.';
    }
    if (t.includes('task')) {
        return 'Design and develop the ' + title + ' module with complete CRUD operations including add, edit and delete.\nDisplay all task records in a searchable and sortable DataTable grid with action buttons.';
    }

    // EMPLOYEE
    if (t.includes('employee')) {
        return 'Build the ' + title + ' module to manage employee records including name, email, mobile and role.\nImplement add, edit and delete functionality with a searchable DataTable grid for all employees.';
    }

    // REPORT
    if (t.includes('report')) {
        return 'Develop the ' + title + ' page with summary cards, charts and detailed data tables for all modules.\nImplement PDF and Excel export functionality with filter options for tasks, employees, assignments and progress.';
    }

    // NAVIGATION / UI
    if (t.includes('navbar') || t.includes('nav bar') || t.includes('navigation')) {
        return 'Design and implement the ' + title + ' with links to all main pages including home, dashboard and modules.\nEnsure responsive design with active state highlighting and smooth navigation transitions.';
    }
    if (t.includes('sidebar')) {
        return 'Create the ' + title + ' with menu links, icons and active state highlighting for all pages.\nEnsure it is fixed on the left side with proper styling and responsive behavior.';
    }
    if (t.includes('layout')) {
        return 'Design the ' + title + ' with sidebar, topbar and content area for consistent page structure.\nImplement responsive grid system with proper spacing and styling across all pages.';
    }
    if (t.includes('header')) {
        return 'Develop the ' + title + ' with page title, user info and navigation controls.\nEnsure consistent styling and layout across all pages of the application.';
    }
    if (t.includes('footer')) {
        return 'Design the ' + title + ' with copyright information and useful links.\nEnsure it remains at the bottom of all pages with consistent styling.';
    }

    // FORMS
    if (t.includes('form')) {
        return 'Build the ' + title + ' with all required input fields, validation and submit functionality.\nImplement proper error messages, success notifications and data saving to the database.';
    }
    if (t.includes('modal')) {
        return 'Implement the ' + title + ' popup with form fields, validation and action buttons.\nEnsure proper open, close and data handling with smooth animations.';
    }

    // PAGES
    if (t.includes('home') || t.includes('landing')) {
        return 'Design the ' + title + ' page with a welcome message and overview of the Task Management System.\nInclude quick navigation links and a clean professional layout.';
    }
    if (t.includes('profile')) {
        return 'Create the ' + title + ' page to display and update user information including name, email and password.\nImplement secure profile update with validation and success notifications.';
    }
    if (t.includes('setting') || t.includes('settings')) {
        return 'Build the ' + title + ' page with options to configure application preferences and user account details.\nImplement save functionality with proper validation and confirmation messages.';
    }

    // DATABASE / API
    if (t.includes('api') || t.includes('endpoint')) {
        return 'Develop the ' + title + ' with proper request handling, validation and JSON response format.\nImplement error handling, status codes and secure data processing.';
    }
    if (t.includes('database') || t.includes('db') || t.includes('sql')) {
        return 'Design and implement the ' + title + ' with proper table structure, relationships and stored procedures.\nEnsure data integrity, indexing and optimized query performance.';
    }

    // TESTING
    if (t.includes('test') || t.includes('testing')) {
        return 'Perform ' + title + ' to verify all features work correctly across different browsers and devices.\nDocument test cases, results and fix any bugs or issues found during testing.';
    }
    if (t.includes('bug') || t.includes('fix')) {
        return 'Identify and resolve the ' + title + ' by analyzing the root cause and implementing the correct solution.\nTest the fix thoroughly to ensure it does not affect other parts of the application.';
    }

    // CHART / GRAPH
    if (t.includes('chart') || t.includes('graph') || t.includes('analytics')) {
        return 'Implement the ' + title + ' using Chart.js with proper data loading, labels and color coding.\nEnsure responsive display and accurate data representation from the database.';
    }

    // NOTIFICATION
    if (t.includes('notification') || t.includes('alert') || t.includes('email')) {
        return 'Build the ' + title + ' system to send alerts and updates to users based on task status and deadlines.\nImplement proper message formatting, delivery tracking and user preference settings.';
    }

    // CALENDAR
    if (t.includes('calendar') || t.includes('schedule')) {
        return 'Develop the ' + title + ' feature to display tasks and deadlines in a monthly or weekly view.\nImplement date navigation, task click details and color coding by priority or status.';
    }

    // SEARCH / FILTER
    if (t.includes('search') || t.includes('filter')) {
        return 'Implement the ' + title + ' functionality to quickly find records based on keywords and criteria.\nEnsure fast and accurate results with proper UI feedback and no data loading delays.';
    }

    // UPLOAD / DOWNLOAD
    if (t.includes('upload')) {
        return 'Develop the ' + title + ' feature to allow users to upload files with proper validation and storage.\nImplement file type and size restrictions with success and error notifications.';
    }
    if (t.includes('download') || t.includes('export')) {
        return 'Implement the ' + title + ' functionality to export data in PDF or Excel format with proper formatting.\nEnsure all visible data is included with headers, styling and accurate information.';
    }

    // CHATBOT
    if (t.includes('chat') || t.includes('bot') || t.includes('assistant')) {
        return 'Build the ' + title + ' with a floating button interface to answer user questions about the system.\nImplement keyword-based response logic covering all modules with a clean chat UI.';
    }

    // DEFAULT - for any other title
    return 'Design and develop the ' + title + ' with all required features, proper validation and user-friendly interface.\nImplement complete functionality with database integration, error handling and success notifications.';
}