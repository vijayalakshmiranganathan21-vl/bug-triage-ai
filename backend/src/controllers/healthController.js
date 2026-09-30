/**
 * Health check controller
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugFlow AI backend is running",
  });
};

export default {
  getHealth,
};
