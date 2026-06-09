let allData = null;
let chartStatus, chartPriority, chartEmp, chartPercent;

$(document).ready(function () {
    let today = new Date().toLocaleDateString('en-GB');
    $("#reportDate").text("Generated on " + today + "  ·  All data included");
    LoadReportData();
});

function formatDate(dateStr) {
    if (!dateStr) return '';
    let timestamp = parseInt(dateStr.replace('/Date(', '').replace(')/', ''));
    let date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
}

function getPriorityBadge(priority) {
    if (priority == 'High') return `<span class="badge badge-high">High</span>`;
    if (priority == 'Medium') return `<span class="badge badge-medium">Medium</span>`;
    return `<span class="badge badge-low">Low</span>`;
}

function getStatusBadge(status) {
    if (status == 'Completed') return `<span class="badge badge-completed">Completed</span>`;
    if (status == 'In Progress') return `<span class="badge badge-progress">In Progress</span>`;
    return `<span class="badge badge-pending">Pending</span>`;
}

function getProgressBar(percentage) {
    let color = percentage == '100%' ? '#16a34a' : percentage == '50%' ? '#2563eb' : '#d97706';
    let width = percentage == '100%' ? '100%' : percentage == '50%' ? '50%' : '5%';
    return `<div class="prog-wrap">
        <div class="prog-bar"><div class="prog-fill" style="width:${width};background:${color};"></div></div>
        <span style="font-size:12px;color:#64748b;">${percentage}</span>
    </div>`;
}

function LoadReportData() {
    $.ajax({
        type: "GET",
        url: "/Home/GetReportData",
        dataType: "json",
        success: function (data) {
            if (data != null) {
                allData = data;

                if (data.Dashboard != null) {
                    $("#totalTasks").text(data.Dashboard.TotalTasks);
                    $("#pendingTasks").text(data.Dashboard.PendingTasks);
                    $("#completedTasks").text(data.Dashboard.CompletedTasks);
                    $("#overdueTasks").text(data.Dashboard.OverdueTasks);
                }

                // populate employee dropdowns for sub filters
                if (data.Employees != null) {
                    data.Employees.forEach(function (emp) {
                        $("#assignEmpFilter").append(`<option value="${emp.empname}">${emp.empname}</option>`);
                        $("#progressEmpFilter").append(`<option value="${emp.empname}">${emp.empname}</option>`);
                    });
                }

                renderTables(data);
                buildCharts(data);
            }
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
}

function renderTables(data) {
    let priorityFilter = $("#priorityFilter").val() || 'all';
    let assignEmpFilter = $("#assignEmpFilter").val() || 'all';
    let progressEmpFilter = $("#progressEmpFilter").val() || 'all';
    let progressStatusFilter = $("#progressStatusFilter").val() || 'all';

    // Tasks
    $("#tasksBody").empty();
    let taskCounter = 1;
    let highCount = 0, medCount = 0, lowCount = 0;
    let filteredTasks = data.Tasks != null ? data.Tasks.filter(function (task) {
        if (task.priority == 'High') highCount++;
        else if (task.priority == 'Medium') medCount++;
        else lowCount++;
        return priorityFilter == 'all' || task.priority == priorityFilter;
    }) : [];

    if (filteredTasks.length > 0) {
        filteredTasks.forEach(function (task) {
            $("#tasksBody").append(`<tr>
                <td>${taskCounter}</td>
                <td>${task.tasktitle}</td>
                <td>${getPriorityBadge(task.priority)}</td>
                <td>${task.description}</td>
                <td>${formatDate(task.startdate)}</td>
                <td>${formatDate(task.duedate)}</td>
            </tr>`);
            taskCounter++;
        });
        $("#tasksNoData").hide();
    } else {
        $("#tasksNoData").show();
    }

    // Employees
    $("#employeesBody").empty();
    let empCounter = 1;
    let empNames = [];
    let empTaskCounts = [];
    if (data.Employees != null) {
        data.Employees.forEach(function (emp) {
            empNames.push(emp.empname);
            empTaskCounts.push(0);
            $("#employeesBody").append(`<tr>
                <td>${empCounter}</td>
                <td>${emp.empname}</td>
                <td>${emp.email}</td>
                <td>${emp.mobile}</td>
                <td>${emp.role}</td>
            </tr>`);
            empCounter++;
        });
    }

    // Assignments
    $("#assignmentsBody").empty();
    let assignCounter = 1;
    let filteredAssignments = data.Assignments != null ? data.Assignments.filter(function (assign) {
        let empIndex = empNames.indexOf(assign.empname);
        if (empIndex >= 0) empTaskCounts[empIndex]++;
        return assignEmpFilter == 'all' || assign.empname == assignEmpFilter;
    }) : [];

    if (filteredAssignments.length > 0) {
        filteredAssignments.forEach(function (assign) {
            $("#assignmentsBody").append(`<tr>
                <td>${assignCounter}</td>
                <td>${assign.empname}</td>
                <td>${assign.tasktitle}</td>
                <td>${formatDate(assign.assigneddate)}</td>
            </tr>`);
            assignCounter++;
        });
        $("#assignmentsNoData").hide();
    } else {
        $("#assignmentsNoData").show();
    }

    // Progress
    $("#progressBody").empty();
    let progCounter = 1;
    let pendingCount = 0, inProgressCount = 0, completedCount = 0;
    let zeroPercent = 0, fiftyPercent = 0, hundredPercent = 0;

    let filteredProgress = data.Progress != null ? data.Progress.filter(function (prog) {
        if (prog.progressstatus == 'Pending') pendingCount++;
        else if (prog.progressstatus == 'In Progress') inProgressCount++;
        else if (prog.progressstatus == 'Completed') completedCount++;

        if (prog.progresspercentage == '0%') zeroPercent++;
        else if (prog.progresspercentage == '50%') fiftyPercent++;
        else if (prog.progresspercentage == '100%') hundredPercent++;

        let empMatch = progressEmpFilter == 'all' || prog.empname == progressEmpFilter;
        let statusMatch = progressStatusFilter == 'all' || prog.progressstatus == progressStatusFilter;
        return empMatch && statusMatch;
    }) : [];

    if (filteredProgress.length > 0) {
        filteredProgress.forEach(function (prog) {
            $("#progressBody").append(`<tr>
                <td>${progCounter}</td>
                <td>${prog.empname}</td>
                <td>${prog.tasktitle}</td>
                <td>${getStatusBadge(prog.progressstatus)}</td>
                <td>${getProgressBar(prog.progresspercentage)}</td>
                <td>${formatDate(prog.updatedate)}</td>
                <td>${prog.remarks}</td>
            </tr>`);
            progCounter++;
        });
        $("#progressNoData").hide();
    } else {
        $("#progressNoData").show();
    }

    buildCharts2(pendingCount, inProgressCount, completedCount, highCount, medCount, lowCount, empNames, empTaskCounts, zeroPercent, fiftyPercent, hundredPercent);
}

function FilterReport() {
    let filter = $("#reportFilter").val();

    // hide all sub filters first
    $("#priorityFilter").hide();
    $("#assignEmpFilter").hide();
    $("#progressEmpFilter").hide();
    $("#progressStatusFilter").hide();

    // reset all sub filters to default when switching
    $("#priorityFilter").val('all');
    $("#assignEmpFilter").val('all');
    $("#progressEmpFilter").val('all');
    $("#progressStatusFilter").val('all');

    // show/hide sections
    if (filter == 'full') {
        $("#sectionMetrics").show();
        $("#sectionTasks").show();
        $("#sectionEmployees").show();
        $("#sectionAssignments").show();
        $("#sectionProgress").show();
        $("#reportDate").text("Generated on " + new Date().toLocaleDateString('en-GB') + "  ·  All data included");
    } else if (filter == 'tasks') {
        $("#sectionMetrics").show();
        $("#sectionTasks").show();
        $("#sectionEmployees").hide();
        $("#sectionAssignments").hide();
        $("#sectionProgress").hide();
        $("#priorityFilter").show();
        $("#reportDate").text("Generated on " + new Date().toLocaleDateString('en-GB') + "  ·  Tasks report");
    } else if (filter == 'employees') {
        $("#sectionMetrics").hide();
        $("#sectionTasks").hide();
        $("#sectionEmployees").show();
        $("#sectionAssignments").hide();
        $("#sectionProgress").hide();
        $("#reportDate").text("Generated on " + new Date().toLocaleDateString('en-GB') + "  ·  Employees report");
    } else if (filter == 'assignments') {
        $("#sectionMetrics").hide();
        $("#sectionTasks").hide();
        $("#sectionEmployees").hide();
        $("#sectionAssignments").show();
        $("#sectionProgress").hide();
        $("#assignEmpFilter").show();
        $("#reportDate").text("Generated on " + new Date().toLocaleDateString('en-GB') + "  ·  Task Assignments report");
    } else if (filter == 'progress') {
        $("#sectionMetrics").hide();
        $("#sectionTasks").hide();
        $("#sectionEmployees").hide();
        $("#sectionAssignments").hide();
        $("#sectionProgress").show();
        $("#progressEmpFilter").show();
        $("#progressStatusFilter").show();
        $("#reportDate").text("Generated on " + new Date().toLocaleDateString('en-GB') + "  ·  Task Progress report");
    }

    if (allData != null) renderTables(allData);
}

function ApplySubFilter() {
    if (allData != null) renderTables(allData);
}

function buildCharts(data) {
    let pendingCount = 0, inProgressCount = 0, completedCount = 0;
    let highCount = 0, medCount = 0, lowCount = 0;
    let empNames = [];
    let empTaskCounts = [];
    let zeroPercent = 0, fiftyPercent = 0, hundredPercent = 0;

    if (data.Tasks != null) {
        data.Tasks.forEach(function (task) {
            if (task.priority == 'High') highCount++;
            else if (task.priority == 'Medium') medCount++;
            else lowCount++;
        });
    }

    if (data.Employees != null) {
        data.Employees.forEach(function (emp) {
            empNames.push(emp.empname);
            empTaskCounts.push(0);
        });
    }

    if (data.Assignments != null) {
        data.Assignments.forEach(function (assign) {
            let empIndex = empNames.indexOf(assign.empname);
            if (empIndex >= 0) empTaskCounts[empIndex]++;
        });
    }

    if (data.Progress != null) {
        data.Progress.forEach(function (prog) {
            if (prog.progressstatus == 'Pending') pendingCount++;
            else if (prog.progressstatus == 'In Progress') inProgressCount++;
            else if (prog.progressstatus == 'Completed') completedCount++;
            if (prog.progresspercentage == '0%') zeroPercent++;
            else if (prog.progresspercentage == '50%') fiftyPercent++;
            else if (prog.progresspercentage == '100%') hundredPercent++;
        });
    }

    buildCharts2(pendingCount, inProgressCount, completedCount, highCount, medCount, lowCount, empNames, empTaskCounts, zeroPercent, fiftyPercent, hundredPercent);
}

function buildCharts2(pending, inprogress, completed, high, med, low, empNames, empCounts, zero, fifty, hundred) {
    if (chartStatus) chartStatus.destroy();
    if (chartPriority) chartPriority.destroy();
    if (chartEmp) chartEmp.destroy();
    if (chartPercent) chartPercent.destroy();

    chartStatus = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'In Progress', 'Completed'],
            datasets: [{ data: [pending, inprogress, completed], backgroundColor: ['#d97706', '#2563eb', '#16a34a'], borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    chartPriority = new Chart(document.getElementById('priorityChart'), {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{ data: [high, med, low], backgroundColor: ['#dc2626', '#d97706', '#16a34a'], borderRadius: 6, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    chartEmp = new Chart(document.getElementById('empChart'), {
        type: 'bar',
        data: {
            labels: empNames,
            datasets: [{ data: empCounts, backgroundColor: '#2563eb', borderRadius: 6, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    chartPercent = new Chart(document.getElementById('percentChart'), {
        type: 'pie',
        data: {
            labels: ['0%', '50%', '100%'],
            datasets: [{ data: [zero, fifty, hundred], backgroundColor: ['#dc2626', '#d97706', '#16a34a'], borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function ExportPDF() {
    generatePDF();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    let today = new Date().toLocaleDateString('en-GB');
    let filter = $("#reportFilter").val();

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Task Management System - Report', 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated on: ' + today, 14, 22);

    // Charts always on page 1
    let statusImg = document.getElementById('statusChart').toDataURL('image/png');
    let priorityImg = document.getElementById('priorityChart').toDataURL('image/png');
    let empImg = document.getElementById('empChart').toDataURL('image/png');
    let percentImg = document.getElementById('percentChart').toDataURL('image/png');

    let chartW = 115;
    let chartH = 75;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Task Progress Status', 14, 30);
    doc.addImage(statusImg, 'PNG', 14, 33, chartW, chartH);
    doc.text('Tasks by Priority', 150, 30);
    doc.addImage(priorityImg, 'PNG', 150, 33, chartW, chartH);
    doc.text('Employee Task Load', 14, 115);
    doc.addImage(empImg, 'PNG', 14, 118, chartW, chartH);
    doc.text('Progress Percentage Breakdown', 150, 115);
    doc.addImage(percentImg, 'PNG', 150, 118, chartW, chartH);

    // Page 2 - Tables
    doc.addPage();
    let yPos = 15;

    if (filter == 'full' || filter == 'tasks') {
        // Summary
        if (filter == 'full') {
            doc.setFontSize(13);
            doc.setTextColor(30, 41, 59);
            doc.text('Summary', 14, yPos);
            doc.autoTable({
                startY: yPos + 4,
                head: [['Total Tasks', 'Pending Tasks', 'Completed Tasks', 'Overdue Tasks']],
                body: [[$("#totalTasks").text(), $("#pendingTasks").text(), $("#completedTasks").text(), $("#overdueTasks").text()]],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontSize: 11 },
                bodyStyles: { fontSize: 13, fontStyle: 'bold', halign: 'center' },
                margin: { left: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text('Tasks', 14, yPos);
        yPos += 4;

        let taskRows = [];
        $('#tasksBody tr:visible').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) taskRows.push(row);
        });

        if (taskRows.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['#', 'Task Title', 'Priority', 'Description', 'Start Date', 'Due Date']],
                body: taskRows,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] },
                margin: { left: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    }

    if (filter == 'full' || filter == 'employees') {
        if (yPos > 170) { doc.addPage(); yPos = 15; }
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text('Employees', 14, yPos);
        yPos += 4;

        let empRows = [];
        $('#employeesBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) empRows.push(row);
        });

        if (empRows.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['#', 'Employee Name', 'Email', 'Mobile', 'Role']],
                body: empRows,
                theme: 'grid',
                headStyles: { fillColor: [124, 58, 237] },
                margin: { left: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    }

    if (filter == 'full' || filter == 'assignments') {
        if (yPos > 170) { doc.addPage(); yPos = 15; }
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text('Task Assignments', 14, yPos);
        yPos += 4;

        let assignRows = [];
        $('#assignmentsBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) assignRows.push(row);
        });

        if (assignRows.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['#', 'Employee', 'Task', 'Assigned Date']],
                body: assignRows,
                theme: 'grid',
                headStyles: { fillColor: [15, 118, 110] },
                margin: { left: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    }

    if (filter == 'full' || filter == 'progress') {
        if (yPos > 170) { doc.addPage(); yPos = 15; }
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text('Task Progress', 14, yPos);
        yPos += 4;

        let progRows = [];
        $('#progressBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) progRows.push(row);
        });

        if (progRows.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['#', 'Employee', 'Task', 'Status', 'Progress', 'Update Date', 'Remarks']],
                body: progRows,
                theme: 'grid',
                headStyles: { fillColor: [124, 58, 237] },
                margin: { left: 14 }
            });
        }
    }

    doc.save('TaskManagement_Report_' + today.replace(/\//g, '-') + '.pdf');
}

function ExportExcel() {
    generateExcel();
}

function generateExcel() {
    const wb = XLSX.utils.book_new();
    let filter = $("#reportFilter").val();

    if (filter == 'full' || filter == 'tasks') {
        if (filter == 'full') {
            let summaryData = [
                ['Task Management System - Report'],
                ['Generated on: ' + new Date().toLocaleDateString('en-GB')],
                [],
                ['Summary'],
                ['Total Tasks', 'Pending Tasks', 'Completed Tasks', 'Overdue Tasks'],
                [$("#totalTasks").text(), $("#pendingTasks").text(), $("#completedTasks").text(), $("#overdueTasks").text()]
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
        }

        let taskData = [['#', 'Task Title', 'Priority', 'Description', 'Start Date', 'Due Date']];
        $('#tasksBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) taskData.push(row);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(taskData), 'Tasks');
    }

    if (filter == 'full' || filter == 'employees') {
        let empData = [['#', 'Employee Name', 'Email', 'Mobile', 'Role']];
        $('#employeesBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) empData.push(row);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(empData), 'Employees');
    }

    if (filter == 'full' || filter == 'assignments') {
        let assignData = [['#', 'Employee', 'Task', 'Assigned Date']];
        $('#assignmentsBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) assignData.push(row);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(assignData), 'Assignments');
    }

    if (filter == 'full' || filter == 'progress') {
        let progData = [['#', 'Employee', 'Task', 'Status', 'Progress', 'Update Date', 'Remarks']];
        $('#progressBody tr').each(function () {
            let row = [];
            $(this).find('td').each(function () { row.push($(this).text().trim()); });
            if (row.length > 0) progData.push(row);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(progData), 'Progress');
    }

    let today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    XLSX.writeFile(wb, 'TaskManagement_Report_' + today + '.xlsx');
}