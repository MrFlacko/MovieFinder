import axios from 'axios';

export default async function handler(req, res) {
  const { title } = req.query;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${title} trailer`,
        key: YOUTUBE_API_KEY,
        maxResults: 1,
        type: 'video'
      }
    });

    if (response.data.items.length === 0) {
      console.error('No videos found');
      res.status(404).json({ message: 'No trailer found' });
      return;
    }

    const video = response.data.items[0];
    const trailerUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
    res.status(200).json({ trailerUrl });
  } catch (error) {
    console.error('Error fetching trailer:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch trailer' });
  }
}
