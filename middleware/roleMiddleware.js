// middlewares/roleMiddleware.js

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role; // extracted from JWT

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access Denied: You do not have permission to perform this action."
      });
    }

    next();
  };
}
