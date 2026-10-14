import { CustomFeature, FeatureComment, User } from '../types';

const SYNC_TOPIC = 'fertobot_features_prince_friend_v2';
const NTFY_BASE_URL = `https://ntfy.sh/${SYNC_TOPIC}`;
const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/priyanshutiwari1010@gmail.com';

export interface SyncPayload {
  type: 'NEW_FEATURE' | 'UPDATE_FEATURE' | 'DELETE_FEATURE' | 'NEW_COMMENT';
  senderId: string;
  senderName: string;
  timestamp: number;
  payload: any;
}

/**
 * Converts a base64 data URL to a binary Blob for multipart/form-data upload
 */
export function dataURLtoBlob(dataurl: string): Blob | null {
  try {
    const parts = dataurl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.warn('Error converting dataURL to Blob:', err);
    return null;
  }
}

/**
 * Sends an email notification to priyanshutiwari1010@gmail.com whenever a new feature is added
 */
export async function sendFeatureEmailNotification(
  feature: CustomFeature,
  user: User
): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();
    formData.append('name', `${user.name} (${user.id})`);
    formData.append('email', user.email || 'notification@fertobot.com');
    formData.append(
      '_subject',
      `🌱 [FertoBot] Feature/Issue Reported by ${user.name}: "${feature.title}"`
    );
    formData.append('feature_title', feature.title);
    formData.append('author', `${user.name} (${user.role})`);
    formData.append('explanation_whats_wrong', feature.userPrompt || feature.summary);
    formData.append('created_at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    formData.append('system_note', 'This report was submitted from FertoBot Modular Studio.');
    formData.append(
      'app_url',
      typeof window !== 'undefined' ? window.location.href : 'https://fertobot.vercel.app'
    );

    if (feature.screenshot) {
      const blob = dataURLtoBlob(feature.screenshot);
      if (blob) {
        formData.append('attachment', blob, 'screenshot.jpg');
        formData.append('has_screenshot', 'Yes (Attached as screenshot.jpg)');
      }
    }

    const response = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Notification email sent with screenshot to priyanshutiwari1010@gmail.com'
    };
  } catch (err: any) {
    console.warn('Email dispatch notice:', err);
    return {
      success: false,
      message: 'Email dispatch queued.'
    };
  }
}

/**
 * Sends an email notification when a comment is added to improve a feature
 */
export async function sendCommentEmailNotification(
  comment: FeatureComment,
  featureTitle: string,
  user: User
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('name', `${user.name} (${user.id})`);
    formData.append('email', user.email || 'notification@fertobot.com');
    formData.append(
      '_subject',
      `💬 [FertoBot Feedback] ${user.name} commented on "${featureTitle}"`
    );
    formData.append('feature_title', featureTitle);
    formData.append('commenter', user.name);
    formData.append('comment_text', comment.text);
    formData.append('comment_date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    formData.append(
      'app_url',
      typeof window !== 'undefined' ? window.location.href : 'https://fertobot.vercel.app'
    );

    if (comment.screenshot) {
      const blob = dataURLtoBlob(comment.screenshot);
      if (blob) {
        formData.append('attachment', blob, 'comment_screenshot.jpg');
        formData.append('has_screenshot', 'Yes (Attached as comment_screenshot.jpg)');
      }
    }

    await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: formData
    });
  } catch (err) {
    console.warn('Comment email dispatch notice:', err);
  }
}

/**
 * Publishes a new feature event to the cloud topic so other active devices receive it
 */
export async function publishFeatureToCloud(
  feature: CustomFeature,
  user: User
): Promise<boolean> {
  try {
    const syncData: SyncPayload = {
      type: 'NEW_FEATURE',
      senderId: user.id,
      senderName: user.name,
      timestamp: Date.now(),
      payload: feature
    };

    await fetch(NTFY_BASE_URL, {
      method: 'POST',
      headers: {
        'Title': `New Feature: ${feature.title}`,
        'Tags': 'sprout,sparkles,farmer',
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: JSON.stringify(syncData)
    });

    return true;
  } catch (err) {
    console.error('Failed to publish feature to cloud:', err);
    return false;
  }
}

/**
 * Publishes a comment to the cloud topic so both Prince and Friend see discussion in real time
 */
export async function publishCommentToCloud(
  comment: FeatureComment,
  featureTitle: string,
  user: User
): Promise<boolean> {
  try {
    const syncData: SyncPayload = {
      type: 'NEW_COMMENT',
      senderId: user.id,
      senderName: user.name,
      timestamp: Date.now(),
      payload: comment
    };

    await fetch(NTFY_BASE_URL, {
      method: 'POST',
      headers: {
        'Title': `Feedback on: ${featureTitle}`,
        'Tags': 'speech_balloon,memo',
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: JSON.stringify(syncData)
    });

    return true;
  } catch (err) {
    console.error('Failed to publish comment to cloud:', err);
    return false;
  }
}

/**
 * Polls historical events from the cloud topic (e.g., when opening the app)
 */
export async function fetchHistoricalEvents(): Promise<SyncPayload[]> {
  try {
    const res = await fetch(`${NTFY_BASE_URL}/json?poll=1&since=24h`);
    if (!res.ok) return [];

    const text = await res.text();
    const lines = text.trim().split('\n');
    const events: SyncPayload[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message) {
          const innerPayload: SyncPayload = JSON.parse(parsed.message);
          if (innerPayload.type && innerPayload.payload) {
            events.push(innerPayload);
          }
        }
      } catch {
        // Ignore unparseable notification messages
      }
    }

    return events;
  } catch (err) {
    console.warn('Failed to fetch historical cloud events:', err);
    return [];
  }
}

/**
 * Listens in real-time via Server-Sent Events (SSE) for features or comments added by Friend or Prince
 */
export function subscribeToCloudEvents(
  onEvent: (event: SyncPayload) => void
): () => void {
  let eventSource: EventSource | null = null;
  let pollInterval: any = null;

  try {
    eventSource = new EventSource(`${NTFY_BASE_URL}/sse`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message) {
          const syncPayload: SyncPayload = JSON.parse(data.message);
          if (syncPayload && syncPayload.type) {
            onEvent(syncPayload);
          }
        }
      } catch {
        // skip non-JSON messages
      }
    };

    eventSource.onerror = () => {
      // If SSE connection drops, fallback to light polling every 12 seconds
      if (!pollInterval) {
        pollInterval = setInterval(async () => {
          const recent = await fetchHistoricalEvents();
          recent.slice(-5).forEach(onEvent);
        }, 12000);
      }
    };
  } catch (err) {
    console.warn('EventSource initialization warning:', err);
  }

  // Cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  };
}
