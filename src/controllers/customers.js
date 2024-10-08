// src/controllers/customers.js

import connectDB from '../db/index.js';  

export const searchCustomers = async (req, res) => {
  const { query } = req.query;

  try {
      const connection = await connectDB(); // Connect to the database
      let results;

      // Search across multiple fields: first_name, last_name, phone_no, email_id, C_unique_id
      const sql = `
          SELECT * FROM customers 
          WHERE first_name LIKE ? 
          OR last_name LIKE ? 
          OR phone_no LIKE ?
          OR email_id LIKE ?
          OR C_unique_id LIKE ?
          OR agent_name LIKE ?
          OR address LIKE ?
          OR contact_type LIKE ?
          OR company_name LIKE ?
          OR disposition LIKE ?
      `;
      
      const searchParam = `%${query}%`;
      const [rows] = await connection.execute(sql, [
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,   
          searchParam,  
          searchParam,  
          searchParam   
      ]);

      results = rows;

      res.status(200).json(results);
  } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json({ message: 'Failed to search customers' });
  }
};

// *****************

export const getAllCustomers = async (req, res) => {
  try {
      const connection = await connectDB();
      const query = `SELECT * FROM customers ORDER BY last_updated DESC`;  
      const [rows] = await connection.execute(query);
      
      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching last updated customers:', error);
      res.status(500).json({ message: 'Failed to fetch records' });
  }
};

// *****************

export const updateCustomer = async (req, res) => {
  const customerId = req.params.id;
  const { first_name, last_name, 
    phone_no, email_id, date_of_birth, 
    address, company_name, contact_type, 
    source, disposition, agent_name } = req.body;

  try {
    const connection = await connectDB(); 

    // Format the date_of_birth to 'YYYY-MM-DD' if it exists
    const formattedDOB = date_of_birth ? new Date(date_of_birth).toISOString().split('T')[0] : null;

    const query = `
      UPDATE customers 
      SET first_name = ?, last_name = ?, 
          phone_no = ?, email_id = ?, 
          date_of_birth = ?, address = ?, 
          company_name = ?, contact_type = ?, 
          source = ?, disposition = ?, 
          agent_name = ? 
      WHERE id = ?`;

    // Ensure undefined values are converted to null before executing the query
    const params = [
      first_name || null,
      last_name || null,
      phone_no || null,
      email_id || null,
      formattedDOB || null,
      address || null,
      company_name || null,
      contact_type || null,
      source || null,
      disposition || null,
      agent_name || null,
      customerId,
    ];

    // Execute the query with sanitized parameters
    const [result] = await connection.execute(query, params);

    res.status(200).json({ message: 'Customer updated successfully!' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

// *****************

// Function to insert change log entries
const insertChangeLog = async (connection, customerId, C_unique_id, changes) => {
  for (const change of changes) {
    const { field, old_value, new_value } = change; 

    // Prepare the insert query
    const changeLogQuery = `
      INSERT INTO customer_change_log (customer_id, C_unique_id, field, old_value, new_value, changed_at) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    // Execute the query
    await connection.execute(changeLogQuery, [
      customerId,
      C_unique_id,
      field,
      old_value || null, 
      new_value || null, 
      new Date(), // Current timestamp
    ]);
  }
};

// *****************

// Function to fetch change history for a customer
const getChangeHistory = async (connection, customerId) => {
  const fetchHistoryQuery = `
    SELECT * FROM customer_change_log 
    WHERE customer_id = ? 
    ORDER BY changed_at DESC`;

  const [changeHistory] = await connection.execute(fetchHistoryQuery, [customerId]);
  return changeHistory;
};

// *****************

// Main function to handle logging and fetching change history
export const historyCustomer = async (req, res) => {
  const { customerId, C_unique_id, changes } = req.body; // Ensure changes is an array of change objects

  // Validate input
  if (!customerId || !C_unique_id || !Array.isArray(changes)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  try {
    const connection = await connectDB();

    // Insert change log entries
    await insertChangeLog(connection, customerId, C_unique_id, changes);

    // Fetch the change history for the customer
    const changeHistory = await getChangeHistory(connection, customerId);

    res.status(200).json({
      message: 'Change history recorded successfully!',
      changeHistory, // Include the change history in the response
    });
  } catch (error) {
    console.error('Error logging change history:', error);
    res.status(500).json({ message: 'Failed to log change history' });
  }
};

// *****************

// Function to handle fetching change history
export const gethistoryCustomer = async (req, res) => {
  const customerId = req.params.id;

  try {
    const connection = await connectDB();

    // Fetch change history for the specified customer
    const changeHistory = await getChangeHistory(connection, customerId);

    if (changeHistory.length === 0) {
      return res.status(404).json({ message: 'No change history found for this customer.' });
    }

    res.status(200).json({
      message: 'Change history retrieved successfully!',
      changeHistory,
    });
  } catch (error) {
    console.error('Error fetching change history:', error);
    res.status(500).json({ message: 'Failed to fetch change history' });
  }
};


// **********

// Function to insert custom fields for a customer
const insertCustomFields = async (connection, user_id, customFields) => {
  const insertQuery = `
    INSERT INTO custom_fields (user_id, field_name, field_value) 
    VALUES (?, ?, ?)`;

  for (const field of customFields) {
    const { field_name, field_value } = field;

    // Execute the insert query
    await connection.execute(insertQuery, [
      user_id,
      field_name,
      field_value,
    ]);
  }
};

// *****************

// Function to handle adding custom fields
export const addCustomFields = async (req, res) => {
  const { user_id, customFields } = req.body; 

  // Validate input
  if (!user_id || !Array.isArray(customFields)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  try {
    const connection = await connectDB();

    // Insert the custom fields for the user
    await insertCustomFields(connection, user_id, customFields);

    res.status(200).json({ message: 'Custom fields added successfully!' });
  } catch (error) {
    console.error('Error adding custom fields:', error);
    res.status(500).json({ message: 'Failed to add custom fields' });
  }
};

// *****************

// Function to update custom fields and log changes
const updateCustomFields = async (connection, user_id, changes) => {
  for (const change of changes) {
    const { field_name, old_value, new_value } = change;

    // Log the change (assuming you have this function defined)
    await insertChangeLog(connection, user_id, [
      { field: field_name, old_value, new_value }
    ]);

    // Update the custom field in the database
    const updateQuery = `
      UPDATE custom_fields 
      SET field_value = ? 
      WHERE user_id = ? AND field_name = ?`;

    await connection.execute(updateQuery, [new_value, user_id, field_name]);
  }
};

// *****************

// Function to retrieve custom fields by user ID
export const getCustomFieldsByCustomerId = async (user_id) => {
    if (!user_id) {
        console.error("User ID is required to fetch custom fields.");
        return null;
    }

    try {
        const connection = await connectDB();
        const sqlQuery = "SELECT * FROM custom_fields WHERE user_id = ?"; 
        const [customFields] = await connection.query(sqlQuery, [user_id]);

        return customFields; // Return the custom fields or an empty array if none found
    } catch (error) {
        console.error("Error fetching custom fields:", error);
        throw error; // Throw the error to be handled in the route
    }
};
