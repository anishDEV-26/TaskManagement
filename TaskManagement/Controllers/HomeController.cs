using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TaskManagement.DataAccessLayer;
using TaskManagement.Models;

namespace TaskManagement.Controllers
{
    public class HomeController : Controller
    {
        readonly Masterdal masterdal = new Masterdal();
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Taskcreation()
        {
            return View();
        }

        [HttpPost]
        public JsonResult SaveTask(TaskDetails task)
        {
            try
            {
                bool IsExecuted = masterdal.SaveTask(task);
                if (IsExecuted)
                    return Json(new { success = true, message = "Task saved successfully." });
                else
                    return Json(new { success = false, message = "Failed To Save Task Details." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        [HttpGet]
        public JsonResult GetTaskList()
        {
            var taskList = masterdal.getTask();
            if (taskList != null)
            {
                return Json(new { GetList = taskList.GetList }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { GetList = new List<TaskDetails>() }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult GetTaskById(int taskid)
        {
            var task = masterdal.GetTaskById(taskid);
            return Json(task, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult UpdateTask(TaskDetails task)
        {
            bool IsExecuted = masterdal.UpdateTask(task);
            if (IsExecuted)
                return Json(new { success = true, message = "Task updated successfully." });
            else
                return Json(new { success = false, message = "Failed to update task." });
        }

        [HttpPost]
        public JsonResult DeleteTask(TaskDetails task)
        {
            bool IsExecuted = masterdal.DeleteTask(task.taskid);
            if (IsExecuted)
                return Json(new { success = true, message = "Task deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete task." });
        }
        public ActionResult Dashboard()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetDashboardCounts()
        {
            var counts = masterdal.GetDashboardCounts();
            if (counts != null)
                return Json(counts, JsonRequestBehavior.AllowGet);
            else
                return Json(new { TotalTasks = 0, PendingTasks = 0, CompletedTasks = 0, OverdueTasks = 0 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult employee()
        {
            return View();
        }

        [HttpPost]
        public JsonResult SaveEmployee(EmployeeDetails emp)
        {
            bool IsExecuted = masterdal.SaveEmployee(emp);
            if (IsExecuted)
                return Json(new { success = true, message = "Employee saved successfully." });
            else
                return Json(new { success = false, message = "Failed to save employee." });
        }

        [HttpGet]
        public JsonResult GetEmployeeList()
        {
            var empList = masterdal.getEmployee();
            if (empList != null)
                return Json(new { GetList = empList.GetList }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { GetList = new List<EmployeeDetails>() }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetEmployeeById(int empid)
        {
            var emp = masterdal.GetEmployeeById(empid);
            return Json(emp, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult UpdateEmployee(EmployeeDetails emp)
        {
            bool IsExecuted = masterdal.UpdateEmployee(emp);
            if (IsExecuted)
                return Json(new { success = true, message = "Employee updated successfully." });
            else
                return Json(new { success = false, message = "Failed to update employee." });
        }

        [HttpPost]
        public JsonResult DeleteEmployee(EmployeeDetails emp)
        {
            bool IsExecuted = masterdal.DeleteEmployee(emp.empid);
            if (IsExecuted)
                return Json(new { success = true, message = "Employee deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete employee." });
        }

        public ActionResult TaskAssign()
        {
            return View();
        }

        [HttpPost]
        public JsonResult SaveTaskAssign(TaskAssignDetails assign)
        {
            bool IsExecuted = masterdal.SaveTaskAssign(assign);
            if (IsExecuted)
                return Json(new { success = true, message = "Task assigned successfully." });
            else
                return Json(new { success = false, message = "Failed to assign task." });
        }

        [HttpGet]
        public JsonResult GetTaskAssignList()
        {
            var assignList = masterdal.getTaskAssign();
            if (assignList != null)
                return Json(new { GetList = assignList.GetList }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { GetList = new List<TaskAssignDetails>() }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult DeleteTaskAssign(TaskAssignDetails assign)
        {
            bool IsExecuted = masterdal.DeleteTaskAssign(assign.assignid);
            if (IsExecuted)
                return Json(new { success = true, message = "Assignment deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete assignment." });
        }

        public ActionResult TaskProgress()
        {
            return View();
        }

        [HttpPost]
        public JsonResult SaveSubTask(SubTaskDetails subtask)
        {
            bool IsExecuted = masterdal.SaveSubTask(subtask);
            if (IsExecuted)
                return Json(new { success = true, message = "Subtask added successfully." });
            else
                return Json(new { success = false, message = "Failed to add subtask." });
        }

        [HttpGet]
        public JsonResult GetSubTasks(int taskid)
        {
            var subtasks = masterdal.GetSubTasks(taskid);
            return Json(subtasks, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult DeleteSubTask(SubTaskDetails subtask)
        {
            bool IsExecuted = masterdal.DeleteSubTask(subtask.subtaskid);
            if (IsExecuted)
                return Json(new { success = true, message = "Subtask deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete subtask." });
        }

        public ActionResult Reports()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetReportData()
        {
            var tasks = masterdal.getTask();
            var employees = masterdal.getEmployee();
            var assignments = masterdal.getTaskAssign();
            var progress = masterdal.getTaskProgress();
            var dashboard = masterdal.GetDashboardCounts();

            return Json(new
            {
                Tasks = tasks != null ? tasks.GetList : new System.Collections.Generic.List<TaskDetails>(),
                Employees = employees != null ? employees.GetList : new System.Collections.Generic.List<EmployeeDetails>(),
                Assignments = assignments != null ? assignments.GetList : new System.Collections.Generic.List<TaskAssignDetails>(),
                Progress = progress != null ? progress.GetList : new System.Collections.Generic.List<TaskProgressDetails>(),
                Dashboard = dashboard
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveTaskProgress(TaskProgressDetails progress)
        {
            bool IsExecuted = masterdal.SaveTaskProgress(progress);
            if (IsExecuted)
                return Json(new { success = true, message = "Progress updated successfully." });
            else
                return Json(new { success = false, message = "Failed to update progress." });
        }

        [HttpGet]
        public JsonResult GetTaskProgressList()
        {
            var progressList = masterdal.getTaskProgress();
            if (progressList != null)
                return Json(new { GetList = progressList.GetList }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { GetList = new List<TaskProgressDetails>() }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult DeleteTaskProgress(TaskProgressDetails progress)
        {
            bool IsExecuted = masterdal.DeleteTaskProgress(progress.progressid);
            if (IsExecuted)
                return Json(new { success = true, message = "Progress deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete progress." });
        }

        public ActionResult Calendar()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetCalendarAssignments()
        {
            var list = masterdal.GetCalendarAssignments();
            return Json(list, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Voice()
        {
            return View();
        }

        public ActionResult Collaboration()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetCollaborationData()
        {
            var employees = masterdal.getEmployee();
            var tasks = masterdal.getTask();
            var assignments = masterdal.getTaskAssign();

            return Json(new
            {
                Employees = employees != null ? employees.GetList : new System.Collections.Generic.List<EmployeeDetails>(),
                Tasks = tasks != null ? tasks.GetList : new System.Collections.Generic.List<TaskDetails>(),
                Assignments = assignments != null ? assignments.GetList : new System.Collections.Generic.List<TaskAssignDetails>()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveCollaborationAssign(TaskAssignDetails assign)
        {
            bool IsExecuted = masterdal.SaveTaskAssign(assign);
            if (IsExecuted)
                return Json(new { success = true, message = "Task assigned successfully." });
            else
                return Json(new { success = false, message = "Failed to assign task." });
        }

        [HttpPost]
        public JsonResult UploadEmployeePdf(int empid)
        {
            try
            {
                if (Request.Files.Count == 0)
                    return Json(new { success = false, message = "No file selected." });

                var file = Request.Files[0];
                if (file == null || file.ContentLength == 0)
                    return Json(new { success = false, message = "Empty file." });

                if (!file.FileName.ToLower().EndsWith(".pdf"))
                    return Json(new { success = false, message = "Only PDF files are allowed." });

                string uploadFolder = Server.MapPath("~/EmployeePdfs/");
                if (!System.IO.Directory.Exists(uploadFolder))
                    System.IO.Directory.CreateDirectory(uploadFolder);

                string uniqueFileName = empid + "_" + DateTime.Now.Ticks + "_" + file.FileName;
                string filePath = System.IO.Path.Combine(uploadFolder, uniqueFileName);
                file.SaveAs(filePath);

                string fileSize = (file.ContentLength / 1024.0).ToString("0.00") + " KB";
                string relativePath = "/EmployeePdfs/" + uniqueFileName;

                EmployeePdfDetails pdf = new EmployeePdfDetails
                {
                    empid = empid,
                    filename = file.FileName,
                    filesize = fileSize,
                    filepath = relativePath
                };

                bool IsExecuted = masterdal.SaveEmployeePdf(pdf);
                if (IsExecuted)
                    return Json(new { success = true, message = "File uploaded successfully.", filename = file.FileName, filepath = relativePath });
                else
                    return Json(new { success = false, message = "Failed to save file." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public JsonResult GetEmployeePdfs(int empid)
        {
            var pdfs = masterdal.GetEmployeePdfs(empid);
            return Json(pdfs, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult DeleteEmployeePdf(int pdfid)
        {
            bool IsExecuted = masterdal.DeleteEmployeePdf(pdfid);
            if (IsExecuted)
                return Json(new { success = true, message = "File deleted successfully." });
            else
                return Json(new { success = false, message = "Failed to delete file." });
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

        [HttpPost]
        public JsonResult GetUserForReset(string usernameoremail)
        {
            var user = masterdal.GetUserByUsernameOrEmail(usernameoremail);
            if (user != null)
            {
                string maskedPhone = "******" + user.phonenumber.Substring(Math.Max(0, user.phonenumber.Length - 4));
                return Json(new { success = true, fullname = user.fullname, maskedphone = maskedPhone });
            }
            else
            {
                return Json(new { success = false, message = "No account found with this username or email." });
            }
        }

        [HttpPost]
        public JsonResult ResetPassword(string usernameoremail, string newpassword)
        {
            bool IsExecuted = masterdal.ResetPassword(usernameoremail, newpassword);
            if (IsExecuted)
                return Json(new { success = true, message = "Password reset successfully. Please login." });
            else
                return Json(new { success = false, message = "Failed to reset password. Please try again." });
        }
    }
}