// Global variable to track last motion (works within single function instance)
let lastMotionData = {
  device: null,
  location: null,
  timestamp: 0,
  message: null
};

// Vercel serverless function for motion detection
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests for dashboard polling
  if (req.method === 'GET') {
    const { since } = req.query;
    const sinceTime = parseInt(since) || 0;
    
    if (lastMotionData.timestamp > sinceTime && lastMotionData.device) {
      return res.status(200).json({
        ok: true,
        hasNewMotion: true,
        motion: lastMotionData
      });
    } else {
      return res.status(200).json({
        ok: true,
        hasNewMotion: false
      });
    }
  }

  // Only allow POST requests for motion detection
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple validation - accept any request with basic structure
  const { deviceId, location } = req.body || {};
  const finalDeviceId = deviceId || 'esp32-unknown';
  const finalLocation = location || 'unknown-location';

  try {
    const timestamp = Date.now();
    const humanReadable = new Date(timestamp).toLocaleString();
    
    // Store motion data for dashboard polling
    lastMotionData = {
      device: finalDeviceId,
      location: finalLocation,
      timestamp: timestamp,
      message: `Motion detected at ${finalLocation} - ${humanReadable}`
    };
    
    // Log the motion detection - this will show in console
    console.log(`🚨 MOTION ALERT: {device: '${finalDeviceId}', timestamp: '${new Date().toISOString()}', message: 'Motion detected at ${finalLocation} - ${humanReadable}'}`);
    
    // Simple success response for ESP32 with notification flag
    res.status(200).json({ 
      ok: true, 
      timestamp,
      message: `Motion detected at ${humanReadable}`,
      device: finalDeviceId,
      location: finalLocation,
      notify: true  // Flag to indicate this should trigger notifications
    });
  } catch (error) {
    console.error('Error processing motion detection:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Internal server error' 
    });
  }
}