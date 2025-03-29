const axios = require('axios');
const { performance } = require('perf_hooks');  // For precise timing

module.exports = async (req, res) => {
  console.log('Request Query:', req.query);

  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  const start = performance.now();

  try {
    console.log(`Requesting domain: ${urlForDomain}`);
    const responseForDomain = await axios.get(urlForDomain, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'opplex.tv:8080',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
    });

    const locationUrl = responseForDomain.headers['location'];
    if (!locationUrl) {
      return res.status(500).send('Error extracting location URL.');
    }

    const domain = new URL(locationUrl).host;
    console.log(`Domain extracted: ${domain}`);

    const responseForTs = await axios.get(`http://watchindia.net:8880/live/97869/86543/${id}.ts`, {
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

    console.log(`Request completed in ${performance.now() - start} ms`);

    res.send(modifiedResponseTextForTs);
  } catch (error) {
    console.error("Error details:", error);
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