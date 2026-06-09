$(document).ready(function () {
    LoadEmployees();
    LoadTasks();
    AssignList();
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

function LoadEmployees() {
    $.ajax({
        type: "GET",
        url: "/Home/GetEmployeeList",
        dataType: "json",
        success: function (data) {
            if (data != null && data.GetList != null) {
                data.GetList.forEach(function (emp) {
                    $("#assignEmployee").append(
                        `<option value="${emp.empid}">${emp.empname}</option>`
                    );
                });
            }
        }
    });
}

function LoadTasks() {
    $.ajax({
        type: "GET",
        url: "/Home/GetTaskList",
        dataType: "json",
        success: function (data) {
            if (data != null && data.GetList != null) {
                data.GetList.forEach(function (task) {
                    $("#assignTask").append(
                        `<option value="${task.taskid}">${task.tasktitle}</option>`
                    );
                });
            }
        }
    });
}

function SaveTaskAssign() {
    let AssignDetails = {
        empid: $("#assignEmployee").val(),
        taskid: $("#assignTask").val(),
        assigneddate: $("#assignDate").val()
    };

    $.ajax({
        type: "POST",
        url: "/Home/SaveTaskAssign",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(AssignDetails),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function AssignList() {
    $.ajax({
        type: "GET",
        url: "/Home/GetTaskAssignList",
        dataType: "json",
        async: true,
        cache: false,
        success: function (data) {
            if (data != null && data.GetList != null && data.GetList.length > 0) {
                $("#assignTableBody").empty();
                let counter = 1;
                data.GetList.forEach(function (assign) {

                    function formatDate(dateStr) {
                        let timestamp = parseInt(dateStr.replace('/Date(', '').replace(')/', ''));
                        let date = new Date(timestamp);
                        return date.toLocaleDateString('en-GB');
                    }

                    // ✅ CHANGED: added view subtask button alongside delete in Action column
                    let row = `<tr>` +
                        `<td class='text-center'>` + counter + `</td>` +
                        `<td class='text-center'>` + assign.empname + `</td>` +
                        `<td class='text-center'>` + assign.tasktitle + `</td>` +
                        `<td class='text-center'>` + formatDate(assign.assigneddate) + `</td>` +
                        `<td class='text-center'>
                            <div style='position:relative;display:inline-block;' class='me-1'>
                                <button type='button' class='btn btn-info btn-sm' style='padding:2px 7px;border-radius:50%;' onclick='ToggleViewSubTask(` + assign.taskid + `, this)' title='View Subtasks'>
                                    <i class='fa-solid fa-eye' style='font-size:11px;'></i>
                                </button>
                                <div class='view-subtask-dropdown' id='viewDropdown_` + assign.taskid + `'></div>
                            </div>
                            <button type='button' class='btn btn-danger btn-sm' onclick='DeleteAssign(` + assign.assignid + `)'>
                                <i class='fa-solid fa-trash'></i>
                            </button>
                        </td>` +
                        `</tr>`;

                    $("#assignTableBody").append(row);
                    counter++;
                });

                if (!$.fn.DataTable.isDataTable('#assignTable')) {
                    $('#assignTable').DataTable();
                }
            } else {
                showToast("No Data Available", 'info');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function DeleteAssign(assignid) {
    $("#deleteAssignId").val(assignid);
    $('#deleteAssignModal').modal('show');
}

function ConfirmDeleteAssign() {
    let assignid = $("#deleteAssignId").val();
    $.ajax({
        type: "POST",
        url: "/Home/DeleteTaskAssign",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ assignid: assignid }),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#deleteAssignModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

// ✅ ADDED: view subtask dropdown (reuses same /Home/GetSubTasks endpoint)
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
                    item.innerHTML = '<i class="fa-solid fa-circle-dot" style="color:#0f766e;margin-right:6px;font-size:11px;"></i>' + subtask.subtasktitle;
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

// ✅ ADDED: close dropdown when clicking outside
$(document).click(function (e) {
    if (!$(e.target).closest('.view-subtask-dropdown, .btn').length) {
        $('.view-subtask-dropdown').removeClass('show');
    }
});