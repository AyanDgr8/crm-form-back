// src/controllers/custom.js

import connectDB from '../db/index.js';  

// Function to insert custom values for a customer
const insertCustomValues = async (connection, customer_id, customFields) => {
    const insertQuery = `
      INSERT INTO customer_custom_values (customer_id, field_id, field_value) 
      VALUES (?, ?, ?)`;
  
    for (const field of customFields) {
        const { fieldId, fieldValue } = field;
  
        // Execute the insert query
        await connection.execute(insertQuery, [
            customer_id,
            fieldId,
            fieldValue || '',  // fieldValue is optional and can be left empty
        ]);
    }
};
  
// Function to handle adding custom values
export const addCustomValues = async (req, res) => {
    const { customer_id, customFields } = req.body; 
  
    // Validate input
    if (!customer_id || !Array.isArray(customFields)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
  
    try {
        const connection = await connectDB();
  
        // Insert the custom values for the customer
        await insertCustomValues(connection, customer_id, customFields);
  
        res.status(200).json({ message: 'Custom values added successfully!' });
    } catch (error) {
        console.error('Error adding custom values:', error);
        res.status(500).json({ message: 'Failed to add custom values' });
    }
};

// Function to insert a custom field
const insertCustomField = async (connection, fieldName, userId) => {
    const insertQuery = `
      INSERT INTO global_custom_fields (field_name, user_id) 
      VALUES (?, ?)`;

    await connection.execute(insertQuery, [fieldName, userId]);
};

// Function to handle adding a custom field
export const addCustomField = async (req, res) => {
    const { fieldName } = req.body; 
    const userId = req.user.id;  // Assuming you are storing the logged-in user's ID

    // Validate input
    if (!fieldName) {
        return res.status(400).json({ message: 'Field name is required' });
    }

    try {
        const connection = await connectDB();

        // Insert the custom field into the global_custom_fields table
        await insertCustomField(connection, fieldName, userId);

        res.status(200).json({ message: 'Custom field added successfully!' });
    } catch (error) {
        console.error('Error adding custom field:', error);
        res.status(500).json({ message: 'Failed to add custom field' });
    }
};



// Function to retrieve custom values by customer ID
export const getCustomValuesByCustomerId = async (customer_id) => {
    if (!customer_id) {
        console.error("Customer ID is required to fetch custom values.");
        return null;
    }

    try {
        const connection = await connectDB();
        const sqlQuery = `
          SELECT g.field_name, c.field_value 
          FROM customer_custom_values c
          JOIN global_custom_fields g ON c.field_id = g.id
          WHERE c.customer_id = ?`;
          
        const [customValues] = await connection.query(sqlQuery, [customer_id]);

        return customValues; // Return the custom values or an empty array if none found
    } catch (error) {
        console.error("Error fetching custom values:", error);
        throw error; // Throw the error to be handled in the route
    }
};
