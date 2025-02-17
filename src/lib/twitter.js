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
    headers: {
      Accept: "application/json",
    },
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
    headers: {
      Accept: "application/json",
    },
  });
}

export async function status() {
  const response = await fetch("/api/twitter/status", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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
      Accept: "application/json",
    },
    body: JSON.stringify({ posts }),
  });

  if (!response.ok) {
    // Parse the error response to get the detailed message
    const errorData = await response.json();
    const error = new Error(errorData.error || "Failed to send post");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
