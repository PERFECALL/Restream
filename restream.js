const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    // Request to fetch the stream data
    const responseForTs = await axios.get(urlForDomain, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',  // Expecting binary data
    });

    console.log(`Stream fetched for ID: ${id}`);

    res.send(responseForTs.data);  // Send the stream data back
  } catch (error) {
    // Log error for debugging
    console.error(`Error fetching stream for ID: ${id}`);
    console.error(error);

    if (error.response) {
      // Respond with the external error status
      return res.status(error.response.status).send(`Error: ${error.response.status}`);
    }

    // General error fallback
    res.status(500).send('An error occurred while processing the stream.');
  }
};