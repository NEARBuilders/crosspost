export function getXTokens() {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return {
    accessToken: cookies.twitter_access_token,
    accessSecret: cookies.twitter_access_secret
  };
}

export async function connectX() {
  const response = await fetch('/api/twitter/auth', {
    method: 'POST',
  });
  
  const data = await response.json();
  if (!data.authUrl) {
    throw new Error('Failed to get X auth URL');
  }
  
  window.location.href = data.authUrl;
}

export async function disconnectX() {
  await fetch('/api/twitter/auth', {
    method: 'DELETE'
  });
}

export async function status() {
  const response = await fetch('/api/twitter/status', {
    method: 'GET'
  });
  
  if (!response.ok) {
    return false;
  }
  
  return response.json();
}

export async function post(text) {
  const response = await fetch('/api/twitter/tweet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = new Error('Failed to send post');
    error.status = response.status;
    throw error;
  }

  return response.json();
}
