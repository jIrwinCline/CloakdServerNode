const pool = require("../db");

exports.createJob = async (req, res) => {
  try {
    let {
      contactFName,
      contactLName,
      contactPhone,
      description,
      duties,
      location,
      hours,
      startDate,
      endDate
    } = req.body;
    startDate = new Date(startDate).toISOString();
    endDate = new Date(endDate).toISOString();
    const customerId = req.session.userData.id;
    const job = await pool.query(
      "INSERT INTO public.job (contact_fname, contact_lname, contact_phone, description, duties, location, start_date, end_date, customer_id, is_completed, created_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'false', current_timestamp) RETURNING *",
      [
        contactFName,
        contactLName,
        contactPhone,
        description,
        duties,
        location,
        startDate,
        endDate,
        customerId
      ]
    );
    res.json(job.rows[0]);
  } catch (err) {
    console.log(err);
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await pool.query("SELECT * FROM public.job");
    if (jobs.rows[0]) res.json(jobs.rows);
    else res.json({ message: "Sorry, no jobs" });
  } catch (err) {
    console.log(err);
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await pool.query("SELECT * FROM public.job WHERE id = $1", [
      id
    ]);
    res.json(job.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.session.userData;
    const job = await pool.query("SELECT * FROM public.job WHERE id = $1", [
      id
    ]);
    if (!job.rows[0].customer_id) res.json({ error: "No Job With The ID" });
    if (
      currentUser.role === "customer" &&
      currentUser.id == job.rows[0].customer_id
    ) {
      const {
        contactFName,
        contactLName,
        contactPhone,
        description,
        duties,
        location,
        startDate,
        endDate
      } = req.body;
      const updatedJob = await pool.query(
        "UPDATE public.job SET contact_fname = $2, contact_lname = $3, contact_phone = $4, description = $5, duties = $6, location = $7, start_date = $8, end_date = $9 WHERE id = $1",
        [
          id,
          contactFName,
          contactLName,
          contactPhone,
          description,
          duties,
          location,
          startDate,
          endDate
        ]
      );
    }
    res.json({ message: "Job Updated" });
  } catch (err) {
    console.error(err);
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteJob = await pool.query("DELETE FROM public.job WHERE id = $1", [
      id
    ]);
    res.json({ message: "Job Deleted" });
  } catch (err) {
    console.log(err);
  }
};
