const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    // First request to fetch the domain (allow redirects)
    const responseForDomain = await axios.get(urlForDomain, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'opplex.tv:8080',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      // Remove maxRedirects: 0 to allow following redirects automatically
    });

    const locationUrl = responseForDomain.headers['location'];

    if (!locationUrl) {
      return res.status(500).send('Error extracting location URL.');
    }

    const domain = new URL(locationUrl).host;

    // Second request to fetch the stream
    const responseForTs = await axios.get(`http://opplex.tv:8080/live/45882233/989898/${id}.ts`, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'opplex.tv:8080',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',
    });

    const modifiedResponseTextForTs = responseForTs.data.toString().replace(
      '/hlsr/',
      `http://${domain}/hlsr/`
    );

    res.send(modifiedResponseTextForTs);
  } catch (error) {
    console.error("Error details:", error); // This will show the error in the logs
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(403).send('Error: 403 Forbidden');
      } else {
        return res.status(500).send(`Error: ${error.response.status}`);
      }
    }
    return res.status(500).send('An error occurred.');
  }
};