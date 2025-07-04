import { vi } from 'vitest';

// OpenAI API mock responses
export const mockOpenAIResponses = {
  chatCompletion: {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4o-mini',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a mock response from OpenAI'
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    }
  },
  
  imageGeneration: {
    created: Date.now(),
    data: [{
      url: 'https://example.com/generated-image.png',
      b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }]
  },

  embeddings: {
    object: 'list',
    data: [{
      object: 'embedding',
      embedding: Array.from({length: 1536}, () => Math.random()),
      index: 0
    }],
    model: 'text-embedding-3-small',
    usage: {
      prompt_tokens: 8,
      total_tokens: 8
    }
  }
};

// Mock fetch for OpenAI API calls
export const mockOpenAIFetch = vi.fn((url: string, options?: any) => {
  const body = options?.body ? JSON.parse(options.body) : {};
  
  if (url.includes('/chat/completions')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockOpenAIResponses.chatCompletion)
    });
  }
  
  if (url.includes('/images/generations')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockOpenAIResponses.imageGeneration)
    });
  }
  
  if (url.includes('/embeddings')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockOpenAIResponses.embeddings)
    });
  }
  
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' })
  });
});

// Mock OpenAI client
export const createMockOpenAIClient = () => ({
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue(mockOpenAIResponses.chatCompletion)
    }
  },
  images: {
    generate: vi.fn().mockResolvedValue(mockOpenAIResponses.imageGeneration)
  },
  embeddings: {
    create: vi.fn().mockResolvedValue(mockOpenAIResponses.embeddings)
  }
});

// Environment variables mock for tests
export const mockOpenAIEnv = {
  OPENAI_API_KEY: 'sk-test-key-123'
};