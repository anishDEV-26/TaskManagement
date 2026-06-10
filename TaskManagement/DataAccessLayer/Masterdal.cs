using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using TaskManagement.Models;

namespace TaskManagement.DataAccessLayer
{
    public class Masterdal
    {
        private SqlConnection con;
        private SqlTransaction tran;

        private void connection()
        {
            string constring = ConfigurationManager.ConnectionStrings["dbCon"].ToString();
            con = new SqlConnection(constring);
            if (con.State == ConnectionState.Open)
                con.Close();

            con.Open();
        }
        public bool SaveTask(TaskDetails task)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertTask", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@tasktitle", task.tasktitle.Trim());
                cmd.Parameters.AddWithValue("@priority", task.priority);
                cmd.Parameters.AddWithValue("@description", task.description.Trim());
                cmd.Parameters.AddWithValue("@startdate", task.startdate.HasValue ? (object)task.startdate.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@duedate", task.duedate.HasValue ? (object)task.duedate.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@CreatedBy", "admin".Trim());
                cmd.Parameters.AddWithValue("@CreatedDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@UpdateBy", "user".Trim());
                cmd.Parameters.AddWithValue("@UpdateDate", DateTime.Now);


                int rowAffected = cmd.ExecuteNonQuery();

                if (rowAffected > 0)
                {
                    tran.Commit();
                    return true;
                }
                else
                {
                    tran.Rollback();
                    return false;
                }
            }
            catch (Exception ex)
            {
                tran.Rollback();
                throw new Exception(ex.Message);
            }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                {
                    con.Close();
                }
            }
        }

        public TaskList GetTask()
        {
            return getTask();
        }

        public TaskList getTask()
        {
            try
            {
                connection();

                SqlCommand cmd = new SqlCommand("sp_getTask", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;

                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    TaskList CL = new TaskList();

                    List<TaskDetails> tasks = new List<TaskDetails>();

                    foreach (DataRow dtr in dt.Rows)
                    {
                        TaskDetails C = new TaskDetails();

                        C.taskid = Convert.ToInt32(dtr["TaskId"]);
                        C.tasktitle = dtr["tasktitle"].ToString();
                        C.priority = dtr["priority"].ToString();
                        C.description = dtr["description"].ToString();
                        C.startdate = dtr["startdate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["startdate"]);
                        C.duedate = dtr["duedate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["duedate"]);

                        tasks.Add(C);
                    }

                    CL.GetList = tasks;

                    return CL;
                }

                return null;
            }

            catch (Exception ex)
            {
                con.Close();
                throw ex;
            }

            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                {
                    con.Close();
                }
            }
        }


        public TaskDetails GetTaskById(int taskid)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getTaskById", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@taskid", taskid);

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    DataRow dtr = dt.Rows[0];
                    TaskDetails task = new TaskDetails();
                    task.taskid = Convert.ToInt32(dtr["TaskId"]);
                    task.tasktitle = dtr["tasktitle"].ToString();
                    task.priority = dtr["priority"].ToString();
                    task.description = dtr["description"].ToString();
                    task.startdate = dtr["startdate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["startdate"]);
                    task.duedate = dtr["duedate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["duedate"]);
                    return task;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool UpdateTask(TaskDetails task)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_updateTask", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@taskid", task.taskid);
                cmd.Parameters.AddWithValue("@tasktitle", task.tasktitle.Trim());
                cmd.Parameters.AddWithValue("@priority", task.priority);
                cmd.Parameters.AddWithValue("@description", task.description.Trim());
                cmd.Parameters.AddWithValue("@startdate", task.startdate);
                cmd.Parameters.AddWithValue("@duedate", task.duedate);
                cmd.Parameters.AddWithValue("@UpdateBy", "admin");
                cmd.Parameters.AddWithValue("@UpdateDate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteTask(int taskid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteTask", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@taskid", taskid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }



        public class TaskList
        {
            public List<TaskDetails> GetList { get; set; }
        }

        public bool SaveEmployee(EmployeeDetails emp)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertEmployee", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empname", emp.empname.Trim());
                cmd.Parameters.AddWithValue("@email", emp.email.Trim());
                cmd.Parameters.AddWithValue("@mobile", emp.mobile.Trim());
                cmd.Parameters.AddWithValue("@role", emp.role.Trim());
                cmd.Parameters.AddWithValue("@CreatedBy", "admin");
                cmd.Parameters.AddWithValue("@CreatedDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@UpdateBy", "admin");
                cmd.Parameters.AddWithValue("@UpdateDate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public EmployeeList getEmployee()
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getEmployee", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    EmployeeList EL = new EmployeeList();
                    List<EmployeeDetails> emps = new List<EmployeeDetails>();

                    foreach (DataRow dtr in dt.Rows)
                    {
                        EmployeeDetails E = new EmployeeDetails();
                        E.empid = Convert.ToInt32(dtr["EmpId"]);
                        E.empname = dtr["EmpName"].ToString();
                        E.email = dtr["Email"].ToString();
                        E.mobile = dtr["Mobile"].ToString();
                        E.role = dtr["Role"].ToString();
                        emps.Add(E);
                    }

                    EL.GetList = emps;
                    return EL;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public EmployeeDetails GetEmployeeById(int empid)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getEmployeeById", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", empid);

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    DataRow dtr = dt.Rows[0];
                    EmployeeDetails E = new EmployeeDetails();
                    E.empid = Convert.ToInt32(dtr["EmpId"]);
                    E.empname = dtr["EmpName"].ToString();
                    E.email = dtr["Email"].ToString();
                    E.mobile = dtr["Mobile"].ToString();
                    E.role = dtr["Role"].ToString();
                    return E;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool UpdateEmployee(EmployeeDetails emp)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_updateEmployee", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", emp.empid);
                cmd.Parameters.AddWithValue("@empname", emp.empname.Trim());
                cmd.Parameters.AddWithValue("@email", emp.email.Trim());
                cmd.Parameters.AddWithValue("@mobile", emp.mobile.Trim());
                cmd.Parameters.AddWithValue("@role", emp.role.Trim());
                cmd.Parameters.AddWithValue("@UpdateBy", "admin");
                cmd.Parameters.AddWithValue("@UpdateDate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteEmployee(int empid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteEmployee", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", empid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public class EmployeeList
        {
            public List<EmployeeDetails> GetList { get; set; }
        }

        public bool SaveTaskAssign(TaskAssignDetails assign)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertTaskAssign", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", assign.empid);
                cmd.Parameters.AddWithValue("@taskid", assign.taskid);
                cmd.Parameters.AddWithValue("@assigneddate", assign.assigneddate.HasValue ? assign.assigneddate.Value : DateTime.Now);
                cmd.Parameters.AddWithValue("@CreatedBy", "admin");
                cmd.Parameters.AddWithValue("@CreatedDate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public TaskAssignList getTaskAssign()
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getTaskAssign", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    TaskAssignList AL = new TaskAssignList();
                    List<TaskAssignDetails> assigns = new List<TaskAssignDetails>();

                    foreach (DataRow dtr in dt.Rows)
                    {
                        TaskAssignDetails A = new TaskAssignDetails();
                        A.assignid = Convert.ToInt32(dtr["AssignId"]);
                        A.empid = Convert.ToInt32(dtr["EmpId"]);
                        A.taskid = Convert.ToInt32(dtr["TaskId"]);
                        A.empname = dtr["EmpName"].ToString();
                        A.tasktitle = dtr["tasktitle"].ToString();
                        A.assigneddate = dtr["AssignedDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["AssignedDate"]);
                        assigns.Add(A);
                    }

                    AL.GetList = assigns;
                    return AL;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteTaskAssign(int assignid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteTaskAssign", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@assignid", assignid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public class TaskAssignList
        {
            public List<TaskAssignDetails> GetList { get; set; }
        }

        public bool SaveTaskProgress(TaskProgressDetails progress)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertTaskProgress", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", progress.empid);
                cmd.Parameters.AddWithValue("@taskid", progress.taskid);
                cmd.Parameters.AddWithValue("@progressstatus", progress.progressstatus);
                cmd.Parameters.AddWithValue("@updatedate", progress.updatedate.HasValue ? progress.updatedate.Value : DateTime.Now);
                cmd.Parameters.AddWithValue("@progresspercentage", progress.progresspercentage);
                cmd.Parameters.AddWithValue("@remarks", progress.remarks ?? "");
                cmd.Parameters.AddWithValue("@CreatedBy", "admin");
                cmd.Parameters.AddWithValue("@CreatedDate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public TaskProgressList getTaskProgress()
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getTaskProgress", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    TaskProgressList PL = new TaskProgressList();
                    List<TaskProgressDetails> progresses = new List<TaskProgressDetails>();

                    foreach (DataRow dtr in dt.Rows)
                    {
                        TaskProgressDetails P = new TaskProgressDetails();
                        P.progressid = Convert.ToInt32(dtr["ProgressId"]);
                        P.empname = dtr["EmpName"].ToString();
                        P.mobile = dtr["Mobile"].ToString();
                        P.tasktitle = dtr["tasktitle"].ToString();
                        P.duedate = dtr["DueDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["DueDate"]);
                        P.progressstatus = dtr["ProgressStatus"].ToString();
                        P.updatedate = dtr["UpdateDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["UpdateDate"]);
                        P.progresspercentage = dtr["ProgressPercentage"].ToString();
                        P.remarks = dtr["Remarks"].ToString();
                        progresses.Add(P);
                    }

                    PL.GetList = progresses;
                    return PL;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteTaskProgress(int progressid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteTaskProgress", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@progressid", progressid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public class TaskProgressList
        {
            public List<TaskProgressDetails> GetList { get; set; }
        }

        public object GetDashboardCounts()
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getDashboardCounts", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    DataRow dtr = dt.Rows[0];
                    return new
                    {
                        TotalTasks = Convert.ToInt32(dtr["TotalTasks"]),
                        PendingTasks = Convert.ToInt32(dtr["PendingTasks"]),
                        CompletedTasks = Convert.ToInt32(dtr["CompletedTasks"]),
                        OverdueTasks = Convert.ToInt32(dtr["OverdueTasks"])
                    };
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool RegisterUser(UserDetails user)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_registerUser", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@fullname", user.fullname.Trim());
                cmd.Parameters.AddWithValue("@username", user.username.Trim());
                cmd.Parameters.AddWithValue("@email", user.email.Trim());
                cmd.Parameters.AddWithValue("@password", user.password.Trim());
                cmd.Parameters.AddWithValue("@phonenumber", user.phonenumber.Trim());
                cmd.Parameters.AddWithValue("@role", user.role.Trim());
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public UserDetails LoginUser(string usernameoremail, string password, string role)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_loginUser", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usernameoremail", usernameoremail.Trim());
                cmd.Parameters.AddWithValue("@password", password.Trim());
                cmd.Parameters.AddWithValue("@role", role.Trim());

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    DataRow dtr = dt.Rows[0];
                    UserDetails user = new UserDetails();
                    user.userid = Convert.ToInt32(dtr["UserId"]);
                    user.fullname = dtr["FullName"].ToString();
                    user.username = dtr["Username"].ToString();
                    user.email = dtr["Email"].ToString();
                    user.role = dtr["Role"].ToString();
                    return user;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool SaveSubTask(SubTaskDetails subtask)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertSubTask", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@taskid", subtask.taskid);
                cmd.Parameters.AddWithValue("@subtasktitle", subtask.subtasktitle.Trim());
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public List<SubTaskDetails> GetSubTasks(int taskid)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getSubTask", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@taskid", taskid);

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                List<SubTaskDetails> subtasks = new List<SubTaskDetails>();
                foreach (DataRow dtr in dt.Rows)
                {
                    SubTaskDetails s = new SubTaskDetails();
                    s.subtaskid = Convert.ToInt32(dtr["SubTaskId"]);
                    s.taskid = Convert.ToInt32(dtr["TaskId"]);
                    s.subtasktitle = dtr["SubTaskTitle"].ToString();
                    subtasks.Add(s);
                }
                return subtasks;
            }
            catch (Exception) { return new List<SubTaskDetails>(); }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteSubTask(int subtaskid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteSubTask", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@subtaskid", subtaskid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }
    

    public List<CalendarAssignmentDetails> GetCalendarAssignments()
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getCalendarAssignments", con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                List<CalendarAssignmentDetails> list = new List<CalendarAssignmentDetails>();
                foreach (DataRow dtr in dt.Rows)
                {
                    CalendarAssignmentDetails c = new CalendarAssignmentDetails();
                    c.assignid = Convert.ToInt32(dtr["AssignId"]);
                    c.assigneddate = dtr["AssignedDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dtr["AssignedDate"]);
                    c.empname = dtr["EmpName"].ToString();
                    c.tasktitle = dtr["TaskTitle"].ToString();
                    list.Add(c);
                }
                return list;
            }
            catch (Exception) { return new List<CalendarAssignmentDetails>(); }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public UserDetails GetUserByUsernameOrEmail(string usernameoremail)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getUserByUsernameOrEmail", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usernameoremail", usernameoremail.Trim());

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    DataRow dtr = dt.Rows[0];
                    UserDetails user = new UserDetails();
                    user.userid = Convert.ToInt32(dtr["UserId"]);
                    user.fullname = dtr["FullName"].ToString();
                    user.username = dtr["Username"].ToString();
                    user.email = dtr["Email"].ToString();
                    user.role = dtr["Role"].ToString();
                    user.phonenumber = dtr["PhoneNumber"].ToString();
                    return user;
                }
                return null;
            }
            catch (Exception) { return null; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool ResetPassword(string usernameoremail, string newpassword)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_resetPassword", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usernameoremail", usernameoremail.Trim());
                cmd.Parameters.AddWithValue("@newpassword", newpassword.Trim());

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool SaveEmployeePdf(EmployeePdfDetails pdf)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_insertEmployeePdf", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", pdf.empid);
                cmd.Parameters.AddWithValue("@filename", pdf.filename);
                cmd.Parameters.AddWithValue("@filesize", pdf.filesize);
                cmd.Parameters.AddWithValue("@filepath", pdf.filepath);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public List<EmployeePdfDetails> GetEmployeePdfs(int empid)
        {
            try
            {
                connection();
                SqlCommand cmd = new SqlCommand("sp_getEmployeePdfs", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@empid", empid);

                SqlDataAdapter adp = new SqlDataAdapter();
                adp.SelectCommand = cmd;
                DataTable dt = new DataTable();
                adp.Fill(dt);

                List<EmployeePdfDetails> pdfs = new List<EmployeePdfDetails>();
                foreach (DataRow dtr in dt.Rows)
                {
                    EmployeePdfDetails p = new EmployeePdfDetails();
                    p.pdfid = Convert.ToInt32(dtr["PdfId"]);
                    p.empid = Convert.ToInt32(dtr["EmpId"]);
                    p.filename = dtr["FileName"].ToString();
                    p.filesize = dtr["FileSize"].ToString();
                    p.filepath = dtr["FilePath"].ToString();
                    p.addedon = dtr["AddedOn"] == DBNull.Value ? DateTime.Now : Convert.ToDateTime(dtr["AddedOn"]);
                    pdfs.Add(p);
                }
                return pdfs;
            }
            catch (Exception) { return new List<EmployeePdfDetails>(); }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public bool DeleteEmployeePdf(int pdfid)
        {
            try
            {
                connection();
                tran = con.BeginTransaction();
                SqlCommand cmd = new SqlCommand("sp_deleteEmployeePdf", con, tran);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@pdfid", pdfid);

                int rowAffected = cmd.ExecuteNonQuery();
                if (rowAffected > 0) { tran.Commit(); return true; }
                else { tran.Rollback(); return false; }
            }
            catch (Exception) { tran.Rollback(); return false; }
            finally
            {
                if (con != null && con.State == ConnectionState.Open)
                    con.Close();
            }
        }
    }
}


