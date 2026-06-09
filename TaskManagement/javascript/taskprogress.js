$(document).ready(function () {
    LoadEmployees();
    ProgressList();

    $("#tprogEmployee").change(function () {
        let empid = $(this).val();
        if (empid != "") {
            LoadTasks(empid);
        } else {
            $("#tprogTask").empty().append('<option value="">Choose Task</option>');
            $("#tprogDueDate").val("");
        }
    });

    $("#tprogTask").change(function () {
        let taskid = $(this).val();
        if (taskid != "") {
            $.ajax({
                type: "GET",
                url: "/Home/GetTaskById?taskid=" + taskid,
                dataType: "json",
                success: function (data) {
                    if (data != null && data.duedate) {
                        let dueDate = new Date(parseInt(data.duedate.replace('/Date(', '').replace(')/', '')));
                        let formatted = dueDate.toISOString().split('T')[0];
                        $("#tprogDueDate").val(formatted);
                    } else {
                        $("#tprogDueDate").val("");
                    }
                }
            });
        } else {
            $("#tprogDueDate").val("");
        }
    });

    $("#tprogStatus").change(function () {
        let status = $(this).val();
        if (status == "Pending") {
            $("#tprogPercentage").val("0%").prop("disabled", true);
        } else if (status == "In Progress") {
            $("#tprogPercentage").val("50%").prop("disabled", true);
        } else if (status == "Completed") {
            $("#tprogPercentage").val("100%").prop("disabled", true);
        } else {
            $("#tprogPercentage").val("").prop("disabled", false);
        }
    });
});

function showToast(message, type) {
    const toastContainer = document.querySelector('.toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-' + type + ' border-0 show';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML =
        '<div class="d-flex">' +
        '<div class="toast-body">' + message + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' +
        '</div>';
    toastContainer.appendChild(toastEl);
    setTimeout(function () { toastEl.remove(); }, 3000);
}

function LoadEmployees() {
    $.ajax({
        type: "GET",
        url: "/Home/GetEmployeeList",
        dataType: "json",
        success: function (data) {
            if (data != null && data.GetList != null) {
                data.GetList.forEach(function (emp) {
                    $("#tprogEmployee").append(
                        '<option value="' + emp.empid + '">' + emp.empname + '</option>'
                    );
                });
            }
        }
    });
}

function LoadTasks(empid) {
    $("#tprogTask").empty().append('<option value="">Choose Task</option>');
    $("#tprogDueDate").val("");

    $.ajax({
        type: "GET",
        url: "/Home/GetTaskAssignList",
        dataType: "json",
        success: function (data) {
            if (data != null && data.GetList != null) {
                data.GetList.forEach(function (assign) {
                    if (assign.empid == empid) {
                        $("#tprogTask").append(
                            '<option value="' + assign.taskid + '">' + assign.tasktitle + '</option>'
                        );
                    }
                });
            }
        }
    });
}

function SaveTaskProgress() {
    var ProgressDetails = {
        empid: $("#tprogEmployee").val(),
        taskid: $("#tprogTask").val(),
        progressstatus: $("#tprogStatus").val(),
        updatedate: $("#tprogDate").val(),
        progresspercentage: $("#tprogPercentage").val(),
        remarks: $("#tprogRemarks").val()
    };

    $.ajax({
        type: "POST",
        url: "/Home/SaveTaskProgress",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(ProgressDetails),
        dataType: "json",
        success: function (response) {
            var message = response.success ? "Success: " + response.message : "Error: " + response.message;
            var type = response.success ? 'success' : 'danger';
            showToast(message, type);
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function ProgressList() {
    $.ajax({
        type: "GET",
        url: "/Home/GetTaskProgressList",
        dataType: "json",
        async: true,
        cache: false,
        success: function (data) {
            if (data != null && data.GetList != null && data.GetList.length > 0) {
                $("#progressTableBody").empty();
                var counter = 1;
                data.GetList.forEach(function (progress) {

                    function formatDate(dateStr) {
                        if (!dateStr) return 'N/A';
                        var timestamp = parseInt(dateStr.replace('/Date(', '').replace(')/', ''));
                        var date = new Date(timestamp);
                        return date.toLocaleDateString('en-GB');
                    }

                    var whatsappBtn = '';
                    if (progress.progressstatus == 'Pending' && progress.mobile) {
                        var mobile = progress.mobile.replace(/\D/g, '');
                        if (mobile.length == 10) {
                            mobile = '91' + mobile;
                        }
                        var dueText = progress.duedate ? formatDate(progress.duedate) : 'N/A';
                        var waMessage = encodeURIComponent(
                            'Dear ' + progress.empname + ', your task "' + progress.tasktitle +
                            '" is currently Pending. The deadline is ' + dueText +
                            '. Please update your progress at the earliest. Thank you.'
                        );
                        var waUrl = 'https://wa.me/' + mobile + '?text=' + waMessage;
                        whatsappBtn = '<a href="' + waUrl + '" target="_blank" class="btn btn-success btn-sm" title="Send WhatsApp Reminder" style="background:#25D366;border:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border-radius:6px;">' +
                            '<i class="fab fa-whatsapp" style="font-size:16px;color:white;"></i>' +
                            '</a>';
                    }

                    let statusClass = progress.progressstatus === 'Completed' ? 'status-completed' : progress.progressstatus === 'In Progress' ? 'status-inprogress' : 'status-pending';
                    let statusIcon = progress.progressstatus === 'Completed' ? 'fa-circle-check' : progress.progressstatus === 'In Progress' ? 'fa-circle-half-stroke' : 'fa-clock';
                    let pct = progress.progresspercentage || '0%';
                    let pctNum = parseInt(pct);
                    let barClass = pctNum >= 100 ? 'progress-100' : pctNum >= 50 ? 'progress-50' : 'progress-0';

                    var row = '<tr>' +
                        '<td class="text-center">' + counter + '</td>' +
                        '<td class="text-center" style="font-weight:600;color:#0f172a;">' + progress.empname + '</td>' +
                        '<td class="text-center" style="font-weight:500;">' + progress.tasktitle + '</td>' +
                        '<td class="text-center"><span class="status-badge ' + statusClass + '"><i class="fa-solid ' + statusIcon + '"></i>' + progress.progressstatus + '</span></td>' +
                        '<td class="text-center" style="color:#64748b;">' + formatDate(progress.updatedate) + '</td>' +
                        '<td class="text-center" style="color:#64748b;">' + formatDate(progress.duedate) + '</td>' +
                        '<td class="text-center"><div class="progress-wrap"><div class="progress-bar-outer"><div class="progress-bar-inner ' + barClass + '"></div></div><span class="progress-label">' + pct + '</span></div></td>' +
                        '<td class="text-center" style="color:#64748b;font-size:12.5px;">' + progress.remarks + '</td>' +
                        '<td class="text-center">' +
                        '<div class="action-btn-wrap">' +
                        '<button type="button" class="btn btn-danger btn-sm" onclick="DeleteProgress(' + progress.progressid + ')">' +
                        '<i class="fa-solid fa-trash"></i>' +
                        '</button>' +
                        (whatsappBtn !== '' ? whatsappBtn : '<span class="action-btn-placeholder"></span>') +
                        '</div>' +
                        '</td>' +
                        '</tr>';

                    $("#progressTableBody").append(row);
                    counter++;
                });

                if (!$.fn.DataTable.isDataTable('#progressTable')) {
                    $('#progressTable').DataTable();
                }
            } else {
                showToast("No Data Available", 'info');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function DeleteProgress(progressid) {
    $("#deleteProgressId").val(progressid);
    $('#deleteProgressModal').modal('show');
}

function ConfirmDeleteProgress() {
    var progressid = $("#deleteProgressId").val();
    $.ajax({
        type: "POST",
        url: "/Home/DeleteTaskProgress",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ progressid: progressid }),
        dataType: "json",
        success: function (response) {
            var message = response.success ? "Success: " + response.message : "Error: " + response.message;
            var type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#deleteProgressModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}