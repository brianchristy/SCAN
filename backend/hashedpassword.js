const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Hashed Password:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

const plainPassword = 'password_for_admin'; 
hashPassword(plainPassword);
