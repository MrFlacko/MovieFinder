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

    const video = response.data.items[0];
    const trailerUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
    
    res.status(200).json({ trailerUrl });
  } catch (error) {
    console.error('Error fetching trailer:', error);
    res.status(500).json({ message: 'Failed to fetch trailer' });
  }
}
