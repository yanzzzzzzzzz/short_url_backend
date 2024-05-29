exports.logout = async (req, res) => {
  res.cookie('customToken', '', { expires: new Date(0) });
  res.cookie('username', '', { expires: new Date(0) });
  return res.status(200).end();
};
