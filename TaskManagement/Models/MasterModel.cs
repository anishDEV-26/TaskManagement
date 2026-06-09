using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TaskManagement.Models
{
    public class TaskDetails
    {
        public int taskid { get; set; }
        public string tasktitle { get; set; }
        public string priority { get; set; }
        public string description { get; set; }
        public DateTime? startdate { get; set; }
        public DateTime? duedate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class EmployeeDetails
    {
        public int empid { get; set; }
        public string empname { get; set; }
        public string email { get; set; }
        public string mobile { get; set; }
        public string role { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class TaskAssignDetails
    {
        public int assignid { get; set; }
        public int empid { get; set; }
        public int taskid { get; set; }
        public string empname { get; set; }
        public string tasktitle { get; set; }
        public DateTime? assigneddate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class TaskProgressDetails
    {
        public int progressid { get; set; }
        public int empid { get; set; }
        public int taskid { get; set; }
        public string empname { get; set; }
        public string mobile { get; set; }       
        public string tasktitle { get; set; }
        public string progressstatus { get; set; }
        public DateTime? updatedate { get; set; }
        public DateTime? duedate { get; set; }   
        public string progresspercentage { get; set; }
        public string remarks { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class UserDetails
    {
        public int userid { get; set; }
        public string fullname { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string phonenumber { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class SubTaskDetails
    {
        public int subtaskid { get; set; }
        public int taskid { get; set; }
        public string subtasktitle { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class CalendarAssignmentDetails
    {
        public int assignid { get; set; }
        public DateTime? assigneddate { get; set; }
        public string empname { get; set; }
        public string tasktitle { get; set; }
    }

    public class EmployeePdfDetails
    {
        public int pdfid { get; set; }
        public int empid { get; set; }
        public string filename { get; set; }
        public string filesize { get; set; }
        public string filepath { get; set; }
        public DateTime addedon { get; set; }
    }
}