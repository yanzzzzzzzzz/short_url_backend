exports.logout = async (req, res) => {
  res.cookie('authToken', '', { expires: new Date(0) });
  res.cookie('username', '', { expires: new Date(0) });
  return res.status(200).end();
};
