const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForTs = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    console.log(`Attempting to fetch stream for ID: ${id} from ${urlForTs}`);

    // Request the .ts stream data
    const responseForTs = await axios.get(urlForTs, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer', // Expecting binary data (video)
    });

    console.log(`Stream fetched successfully for ID: ${id}`);

    // Set proper content type for video streaming
    res.set('Content-Type', 'video/MP2T'); 

    // Send the stream data back to the client
    res.send(responseForTs.data);
  } catch (error) {
    // Log error for debugging
    console.error(`Error fetching stream for ID: ${id}`);
    console.error(error);

    if (error.response) {
      // Log the response status and headers for debugging
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
      return res.status(error.response.status).send(`Error: ${error.response.status}`);
    } else {
      // General error fallback
      console.error('Unknown error occurred');
      res.status(500).send('An error occurred while processing the stream.');
    }
  }
};
