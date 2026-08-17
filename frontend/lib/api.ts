const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

type StreamOptions = {
  message: string;
  conversationId: string | null;
  onChunk: (chunk: string) => void;
};

export async function sendMessage({
  message,
  conversationId,
  onChunk,
}: StreamOptions) {
  const response = await fetch(
    `${API_URL}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Backend error:",
      errorText
    );

    throw new Error(
      "Failed to send message"
    );
  }

  const newConversationId =
    response.headers.get(
      "X-Conversation-Id"
    );

  if (!response.body) {
    throw new Error(
      "Response body is empty"
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) break;

    const chunk =
      decoder.decode(value, {
        stream: true,
      });

    if (chunk) {
      onChunk(chunk);
    }
  }

  const finalChunk =
    decoder.decode();

  if (finalChunk) {
    onChunk(finalChunk);
  }

  return newConversationId;
}

export async function getConversations() {
  const response = await fetch(
    `${API_URL}/api/conversations`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch conversations"
    );
  }

  return response.json();
}

export async function getConversation(
  conversationId: string
) {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch conversation"
    );
  }

  return response.json();
}

export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "voice.webm"
  );

  const response = await fetch(
    `${API_URL}/api/voice/transcribe`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Voice transcription failed: ${errorText}`
    );
  }

  const data = await response.json();

  return data.text ?? "";
}