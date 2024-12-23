const jwt = require("jsonwebtoken");
const { users_controller } = require("../controller/index");
const { token } = require("morgan");

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("Token tidak ada");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Token tidak valid");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    if (!decoded) {
      throw new Error("Token invalid");
    }

    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ status: 401, error: error.message });
  }
};
const verifyToken = async (req, res, next) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User tidak memiliki akses");
    }

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ status: 500, error: error.message });
  }
};

const allowRole = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.role)) {
      return next();
    }
    return res
      .status(403)
      .json({ status: 403, error: "User tidak memiliki akses" });
    };
  };
const SuperAdminOnly = (req, res, next) => {
  verifyUser(req, res, next, () => {
    allowRole(["SUPER ADMIN"])(req, res, next);
  });
};
const AdminOnly = (req, res, next) => {
  verifyUser(req, res, next, () => {
    allowRole(["ADMIN"])(req, res, next);
  });
};
const SuperAdminOrAdminOnly = (req, res, next) => {
  verifyUser(req, res, next, () => {
    allowRole(["SUPER ADMIN", "ADMIN"])(req, res, next);
  });
};


module.exports = {
  verifyUser,
  SuperAdminOnly,
  AdminOnly,
  SuperAdminOrAdminOnly,
  verifyToken,
};
