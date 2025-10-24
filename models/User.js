import db from "../config/db.js";

export const createUserTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
     user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- store hashed passwords in production
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Accountant', 'Pharmacist') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.execute(query);
};

export default {
  createUserTable
};
