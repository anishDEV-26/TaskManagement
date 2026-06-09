console.log("dashboard.js v5 loaded");
$(document).ready(function () {
    LoadDashboard();
});

function animateCount(id, target) {
    let el = document.getElementById(id);
    if (!el) return;
    if (el._animTarget === target) return;
    el._animTarget = target;
    let start = 0;
    let step = Math.ceil(target / 60);
    if (step < 1) step = 1;
    clearInterval(el._animTimer);
    el._animTimer = setInterval(function () {
        start += step;
        if (start >= target) {
            start = target;
            clearInterval(el._animTimer);
        }
        el.textContent = start;
    }, 16);
}

function LoadDashboard() {
    $.ajax({
        type: "GET",
        url: "/Home/GetDashboardCounts",
        dataType: "json",
        success: function (data) {
            if (data != null) {
                animateCount('totalTasks', data.TotalTasks);
                animateCount('pendingTasks', data.PendingTasks);
                animateCount('completedTasks', data.CompletedTasks);
                animateCount('overdueTasks', data.OverdueTasks);
            }
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
}