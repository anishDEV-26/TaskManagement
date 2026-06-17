using System;
using System.Linq;
using System.Web.Mvc;
using TaskManagement.DataAccessLayer;
using TaskManagement.Models;

namespace TaskManagement.Controllers
{
    public class EmployeeController : Controller
    {
        readonly Masterdal masterdal = new Masterdal();

        private bool IsEmployeeLoggedIn()
        {
            return Session["EmpId"] != null;
        }

        protected override void OnActionExecuting(System.Web.Mvc.ActionExecutingContext filterContext)
        {
            if (!IsEmployeeLoggedIn())
            {
                filterContext.Result = RedirectToAction("Login", "Account");
                return;
            }
            base.OnActionExecuting(filterContext);
        }

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetMyTasks()
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            var assignList = masterdal.getTaskAssign();
            var taskList = masterdal.getTask();

            var myAssignments = assignList != null ? assignList.GetList.Where(a => a.empid == empid).ToList() : new System.Collections.Generic.List<TaskAssignDetails>();
            var allTasks = taskList != null ? taskList.GetList : new System.Collections.Generic.List<TaskDetails>();
            var progressList = masterdal.getTaskProgress();
            var allProgress = progressList != null ? progressList.GetList : new System.Collections.Generic.List<TaskProgressDetails>();

            var myTasks = myAssignments.Select(a =>
            {
                var t = allTasks.FirstOrDefault(x => x.taskid == a.taskid);
                var latestProgress = allProgress.Where(p => p.empid == empid && p.tasktitle == a.tasktitle)
                                                 .OrderByDescending(p => p.progressid).FirstOrDefault();
                return new
                {
                    taskid = a.taskid,
                    assignid = a.assignid,
                    tasktitle = a.tasktitle,
                    description = t != null ? t.description : "",
                    priority = t != null ? t.priority : "",
                    startdate = t != null ? t.startdate : null,
                    duedate = t != null ? t.duedate : null,
                    assigneddate = a.assigneddate,
                    status = latestProgress != null ? latestProgress.progressstatus : "Pending"
                };
            }).ToList();

            return Json(new { success = true, GetList = myTasks }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult UpdateProgress()
        {
            return View();
        }

        [HttpPost]
        public JsonResult SaveMyProgress(string tasktitle, string progressstatus, string remarks)
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            var assignList = masterdal.getTaskAssign();
            var myAssignment = assignList != null ? assignList.GetList.FirstOrDefault(a => a.empid == empid && a.tasktitle.ToLower() == tasktitle.ToLower()) : null;

            if (myAssignment == null)
            {
                return Json(new { success = false, message = "This task is not assigned to you. Please check the task name." });
            }

            string percentage = "0";
            if (progressstatus == "In Progress") percentage = "50";
            else if (progressstatus == "Completed") percentage = "100";

            TaskProgressDetails progress = new TaskProgressDetails
            {
                empid = empid,
                taskid = myAssignment.taskid,
                progressstatus = progressstatus,
                progresspercentage = percentage,
                remarks = remarks,
                updatedate = DateTime.Now
            };

            bool IsExecuted = masterdal.SaveTaskProgress(progress);
            if (IsExecuted)
                return Json(new { success = true, message = "Progress updated successfully." });
            else
                return Json(new { success = false, message = "Failed to update progress." });
        }

        public ActionResult Calendar()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetMyCalendarAssignments()
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            string empname = Session["FullName"].ToString();
            var list = masterdal.GetCalendarAssignments();
            var myList = list.Where(a => a.empname == empname).ToList();
            return Json(myList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Profile()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetMyProfile()
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            var emp = masterdal.GetEmployeeById(empid);
            return Json(emp, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Notifications()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetMyNotifications()
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            var assignList = masterdal.getTaskAssign();
            var taskList = masterdal.getTask();
            var myAssignments = assignList != null ? assignList.GetList.Where(a => a.empid == empid).ToList() : new System.Collections.Generic.List<TaskAssignDetails>();
            var allTasks = taskList != null ? taskList.GetList : new System.Collections.Generic.List<TaskDetails>();

            var notifications = new System.Collections.Generic.List<object>();

            foreach (var a in myAssignments)
            {
                var t = allTasks.FirstOrDefault(x => x.taskid == a.taskid);
                notifications.Add(new
                {
                    type = "assigned",
                    title = "New task assigned: " + a.tasktitle,
                    date = a.assigneddate
                });
                if (t != null && t.duedate.HasValue)
                {
                    var daysLeft = (t.duedate.Value.Date - DateTime.Now.Date).Days;
                    if (daysLeft >= 0 && daysLeft <= 3)
                    {
                        notifications.Add(new
                        {
                            type = "duesoon",
                            title = "Task due soon: " + a.tasktitle + " (" + daysLeft + " day(s) left)",
                            date = t.duedate
                        });
                    }
                }
            }

            return Json(notifications, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Documents()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetMyDocuments()
        {
            int empid = Convert.ToInt32(Session["EmpId"]);
            var pdfs = masterdal.GetEmployeePdfs(empid);
            return Json(pdfs, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ViewPdf(string path)
        {
            string fullPath = Server.MapPath(path);
            if (System.IO.File.Exists(fullPath))
            {
                return File(fullPath, "application/pdf");
            }
            return HttpNotFound();
        }

        public ActionResult Logout()
        {
            Session.Clear();
            return RedirectToAction("Login", "Account");
        }
    }
}