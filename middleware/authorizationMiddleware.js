const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res
          .status(401)
          .json({ message: "User role not found in token" });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: You do not have permission for this action",
        });
      }

      next();
    } catch (error) {
      console.error("Role check failed:", error.message);
      res.status(500).json({ message: "Internal server error in role check" });
    }
  };
};

export default roleCheck;
