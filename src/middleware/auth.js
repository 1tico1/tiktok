function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

module.exports = { requireAuth };