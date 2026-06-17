using System;
using System.Web.Mvc;
using TaskManagement.DataAccessLayer;
using TaskManagement.Models;
namespace TaskManagement.Controllers
{
    public class AccountController : Controller
    {
        readonly Masterdal masterdal = new Masterdal();
        public ActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public JsonResult LoginUser(string usernameoremail, string password, string role)
        {
            if (role == "Admin")
            {
                var user = masterdal.LoginUser(usernameoremail, password, role);
                if (user != null)
                {
                    Session["UserId"] = user.userid;
                    Session["FullName"] = user.fullname;
                    Session["Username"] = user.username;
                    Session["Role"] = user.role;
                    return Json(new { success = true, message = "Login successful.", redirect = "/Home/Index" });
                }
                else
                {
                    return Json(new { success = false, message = "Invalid username or password." });
                }
            }
            else if (role == "Employee")
            {
                var emp = masterdal.LoginEmployee(usernameoremail, password);
                if (emp != null)
                {
                    Session["EmpId"] = emp.empid;
                    Session["FullName"] = emp.empname;
                    Session["Username"] = emp.email;
                    Session["Email"] = emp.email;
                    Session["Mobile"] = emp.mobile;
                    Session["Role"] = emp.role;
                    return Json(new { success = true, message = "Login successful.", redirect = "/Employee/Index" });
                }
                else
                {
                    return Json(new { success = false, message = "Invalid email or password." });
                }
            }
            else
            {
                return Json(new { success = false, message = "Please select a role." });
            }
        }
        public ActionResult Logout()
        {
            Session.Clear();
            return RedirectToAction("Login", "Account");
        }
    }
}