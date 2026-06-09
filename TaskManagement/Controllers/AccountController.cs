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

        public ActionResult Signup()
        {
            return View();
        }

        [HttpPost]
        public JsonResult LoginUser(string usernameoremail, string password)
        {
            var user = masterdal.LoginUser(usernameoremail, password);
            if (user != null)
            {
                Session["UserId"] = user.userid;
                Session["FullName"] = user.fullname;
                Session["Username"] = user.username;
                return Json(new { success = true, message = "Login successful." });
            }
            else
            {
                return Json(new { success = false, message = "Invalid username or password." });
            }
        }

        [HttpPost]
        public JsonResult RegisterUser(UserDetails user)
        {
            bool IsExecuted = masterdal.RegisterUser(user);
            if (IsExecuted)
                return Json(new { success = true, message = "Registration successful. Please login." });
            else
                return Json(new { success = false, message = "Registration failed. Please try again." });
        }

        public ActionResult Logout()
        {
            Session.Clear();
            return RedirectToAction("Login", "Account");
        }

   
        }
    }

  