const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  // Directly use the external URL
  const urlForTs = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    const responseForTs = await axios.get(urlForTs, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',
    });

    res.send(responseForTs.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).send(`Error: ${error.response.status}`);
    }

    res.status(500).send('An error occurred while processing the stream.');
  }
};