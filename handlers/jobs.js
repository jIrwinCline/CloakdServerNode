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
