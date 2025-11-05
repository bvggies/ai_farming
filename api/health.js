module.exports = async (req, res) => {
  return res.status(200).json({
    status: 'OK',
    message: 'AI Farming API is running',
    timestamp: new Date().toISOString()
  });
};


