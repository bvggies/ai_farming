module.exports = async (req, res) => {
  return res.status(200).json({
    status: 'OK',
    message: 'Appah Farms Knowledge Hub API is running',
    timestamp: new Date().toISOString()
  });
};


