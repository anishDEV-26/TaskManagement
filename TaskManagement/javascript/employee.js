let currentEmpId = null;

$(document).ready(function () {
    EmployeeList();
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

function SaveEmployee() {
    let EmpDetails = {
        empname: $("#inputEmpName").val(),
        email: $("#inputEmail").val(),
        mobile: $("#inputMobile").val(),
        role: $("#inputRole").val()
    };
    $.ajax({
        type: "POST",
        url: "/Home/SaveEmployee",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(EmpDetails),
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

function EmployeeList() {
    $.ajax({
        type: "GET",
        url: "/Home/GetEmployeeList",
        dataType: "json",
        async: true,
        cache: false,
        success: function (data) {
            if (data != null && data.GetList != null && data.GetList.length > 0) {
                $("#employeeTableBody").empty();
                var counter = 1;
                var empList = data.GetList;
                var loadedCount = 0;
                var rowsData = [];

                // First build all rows without pdf count
                empList.forEach(function (emp) {
                    rowsData.push({ emp: emp, counter: counter });
                    counter++;
                });

                // Render rows first
                rowsData.forEach(function (item) {
                    var emp = item.emp;
                    var row = '<tr>' +
                        '<td class="text-center">' + item.counter + '</td>' +
                        '<td class="text-center">' + emp.empname + '</td>' +
                        '<td class="text-center">' + emp.email + '</td>' +
                        '<td class="text-center">' + emp.mobile + '</td>' +
                        '<td class="text-center">' + emp.role + '</td>' +
                        '<td class="text-center">' +
                        '<button type="button" class="btn btn-info btn-sm me-1" onclick="EditEmployee(' + emp.empid + ')" title="Edit">' +
                        '<i class="fa-solid fa-pen-to-square"></i>' +
                        '</button>' +
                        '<button type="button" class="btn btn-danger btn-sm me-1" onclick="DeleteEmployee(' + emp.empid + ')" title="Delete">' +
                        '<i class="fa-solid fa-trash"></i>' +
                        '</button>' +
                        '<button type="button" class="btn btn-warning btn-sm me-1" onclick="ImportPdf(' + emp.empid + ')" title="Import PDF" style="font-size:11px;">' +
                        '<i class="fa-solid fa-file-import"></i> Import' +
                        '</button>' +
                        '<button type="button" class="btn btn-secondary btn-sm" onclick="ViewPdfs(' + emp.empid + ', \'' + emp.empname + '\')" title="View Files" style="position:relative;">' +
                        '<i class="fa-solid fa-folder-open"></i>' +
                        '<span class="pdf-count-badge" id="pdfBadge_' + emp.empid + '" style="display:none;position:absolute;top:-6px;right:-6px;background:#dc2626;color:white;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid white;"></span>' +
                        '</button>' +
                        '</td>' +
                        '</tr>';
                    $("#employeeTableBody").append(row);
                });

                // Initialize DataTable
                if (!$.fn.DataTable.isDataTable('#employeeTable')) {
                    $('#employeeTable').DataTable();
                }

                // Load PDF count for each employee
                rowsData.forEach(function (item) {
                    $.ajax({
                        type: "GET",
                        url: "/Home/GetEmployeePdfs?empid=" + item.emp.empid,
                        dataType: "json",
                        success: function (pdfData) {
                            if (pdfData != null && pdfData.length > 0) {
                                var badge = document.getElementById('pdfBadge_' + item.emp.empid);
                                if (badge) {
                                    badge.innerText = pdfData.length;
                                    badge.style.display = 'flex';
                                }
                            }
                        }
                    });
                });

            } else {
                showToast("No Data Available", 'info');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function EditEmployee(empid) {
    $.ajax({
        type: "GET",
        url: "/Home/GetEmployeeById?empid=" + empid,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                $("#editEmpId").val(data.empid);
                $("#editEmpName").val(data.empname);
                $("#editEmail").val(data.email);
                $("#editMobile").val(data.mobile);
                $("#editRole").val(data.role);
                $('#editEmployeeModal').modal('show');
            }
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function UpdateEmployee() {
    let EmpDetails = {
        empid: $("#editEmpId").val(),
        empname: $("#editEmpName").val(),
        email: $("#editEmail").val(),
        mobile: $("#editMobile").val(),
        role: $("#editRole").val()
    };
    $.ajax({
        type: "POST",
        url: "/Home/UpdateEmployee",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(EmpDetails),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#editEmployeeModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

function DeleteEmployee(empid) {
    $("#deleteEmpId").val(empid);
    $('#deleteEmployeeModal').modal('show');
}

function ConfirmDeleteEmployee() {
    let empid = $("#deleteEmpId").val();
    $.ajax({
        type: "POST",
        url: "/Home/DeleteEmployee",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ empid: empid }),
        dataType: "json",
        success: function (response) {
            let message = response.success ? "Success: " + response.message : "Error: " + response.message;
            let type = response.success ? 'success' : 'danger';
            showToast(message, type);
            $('#deleteEmployeeModal').modal('hide');
            setTimeout(function () { window.location.reload(true); }, 3000);
        },
        error: function (xhr, status, error) { alert("Error: " + error); }
    });
}

// PDF FUNCTIONS
function ImportPdf(empid) {
    currentEmpId = empid;
    $("#hiddenFileInput").val('');
    $("#hiddenFileInput").click();
}

function UploadPdf() {
    var files = $("#hiddenFileInput")[0].files;
    if (!files || files.length === 0) return;

    var invalidFiles = [];
    for (var i = 0; i < files.length; i++) {
        if (!files[i].name.toLowerCase().endsWith('.pdf')) {
            invalidFiles.push(files[i].name);
        }
    }

    if (invalidFiles.length > 0) {
        alert('Only PDF files are allowed. Invalid files: ' + invalidFiles.join(', '));
        return;
    }

    var totalFiles = files.length;
    var uploadCount = 0;
    var successCount = 0;

    showToast('Uploading ' + totalFiles + ' file(s)...', 'info');

    // Convert FileList to array first
    var fileArray = Array.from(files);

    fileArray.forEach(function (file) {
        var formData = new FormData();
        formData.append('file', file);

        $.ajax({
            type: "POST",
            url: "/Home/UploadEmployeePdf?empid=" + currentEmpId,
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                uploadCount++;
                if (response.success) {
                    successCount++;
                }
                if (uploadCount === totalFiles) {
                    if (successCount === totalFiles) {
                        showToast('Successfully uploaded all ' + totalFiles + ' file(s).', 'success');
                    } else {
                        showToast('Uploaded ' + successCount + ' of ' + totalFiles + ' file(s).', 'warning');
                    }
                }
            },
            error: function () {
                uploadCount++;
                if (uploadCount === totalFiles) {
                    showToast('Some files failed to upload.', 'danger');
                }
            }
        });
    });
}
function ViewPdfs(empid, empname) {
    currentEmpId = empid;
    $("#pdfModalEmpName").text(empname);
    LoadPdfList(empid);
    $('#pdfListModal').modal('show');
}

function LoadPdfList(empid) {
    $("#pdfListContainer").html('<div class="text-center p-4"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i><br><br>Loading files...</div>');

    $.ajax({
        type: "GET",
        url: "/Home/GetEmployeePdfs?empid=" + empid,
        dataType: "json",
        success: function (data) {
            $("#pdfListContainer").empty();

            if (data != null && data.length > 0) {
                data.forEach(function (pdf) {
                    let addedOn = new Date(parseInt(pdf.addedon.replace('/Date(', '').replace(')/', ''))).toLocaleDateString('en-GB');
                    $("#pdfListContainer").append(`
                        <div class="pdf-item" id="pdf_${pdf.pdfid}">
                            <div class="pdf-icon">
                                <i class="fa-solid fa-file-pdf"></i>
                            </div>
                            <div class="pdf-info">
                                <div class="pdf-name" onclick="OpenPdf('${pdf.filepath}')">${pdf.filename}</div>
                                <div class="pdf-meta">${pdf.filesize} &nbsp;·&nbsp; Added on ${addedOn}</div>
                            </div>
                            <button class="pdf-delete-btn" onclick="DeletePdf(${pdf.pdfid})" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `);
                });
            } else {
                $("#pdfListContainer").html(`
                    <div class="pdf-empty">
                        <i class="fa-solid fa-folder-open"></i>
                        No files imported yet.<br>
                        <small>Click the Import button to add PDF files.</small>
                    </div>
                `);
            }
        },
        error: function () {
            $("#pdfListContainer").html('<div class="text-center p-4 text-danger">Error loading files.</div>');
        }
    });
}

function OpenPdf(filepath) {
    window.open('/Home/ViewPdf?path=' + encodeURIComponent(filepath), '_blank');
}

function DeletePdf(pdfid) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    $.ajax({
        type: "POST",
        url: "/Home/DeleteEmployeePdf?pdfid=" + pdfid,
        dataType: "json",
        success: function (response) {
            if (response.success) {
                $('#pdf_' + pdfid).fadeOut(300, function () { $(this).remove(); });
                showToast('File deleted successfully.', 'success');
                if ($("#pdfListContainer .pdf-item").length === 0) {
                    $("#pdfListContainer").html(`
                        <div class="pdf-empty">
                            <i class="fa-solid fa-folder-open"></i>
                            No files imported yet.
                        </div>
                    `);
                }
            } else {
                showToast('Error: ' + response.message, 'danger');
            }
        },
        error: function () { alert("Error deleting file."); }
    });
}