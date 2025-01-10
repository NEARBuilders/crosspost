// SDK to communicate with the API
// API uses the service

export function getTwitterTokens() {
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});

  return {
    accessToken: cookies.twitter_access_token,
  };
}

export async function connectTwitter() {
  const response = await fetch("/api/twitter/auth", {
    method: "POST",
  });

  const data = await response.json();
  if (!data.authUrl) {
    throw new Error("Failed to get Twitter Auth URL");
  }

  window.location.href = data.authUrl;
}

export async function disconnectTwitter() {
  await fetch("/api/twitter/auth", {
    method: "DELETE",
  });
}

export async function status() {
  const response = await fetch("/api/twitter/status", {
    method: "GET",
  });

  if (!response.ok) {
    return false;
  }

  return response.json();
}

export async function tweet(posts) {
  const response = await fetch("/api/twitter/tweet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ posts }),
  });

  if (!response.ok) {
    const error = new Error("Failed to send post");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
