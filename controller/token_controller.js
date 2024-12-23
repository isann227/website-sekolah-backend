const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("./users_controller");
require('dotenv').config();

const createToken = async (email) => {
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      console.error("User not found for email:", email); 
      throw new Error("User not found.");
    }

    const secretKey = process.env.ACCESS_SECRET_TOKEN;

    if (!secretKey) {
      console.error("Secret key is not defined in environment variables."); 
      throw new Error("Secret key is not defined.");
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role
      },
      secretKey,
      { expiresIn: "1h" }
    );
    return token;
  } catch (error) {
    console.error("Error creating token:", error); 
    throw new Error("Error creating token.");
  }
};

const verifyToken = async (token) => {
  try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
      return decoded.email;
  } catch (error) {
      return null;
  }
};

module.exports = { 
  createToken,
  verifyToken
};
