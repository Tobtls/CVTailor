/**
 * Safe fetch helper that validates JSON responses and provides clear, human-readable error messages
 * without crashing when receiving HTML error pages from proxies or gateways.
 */
export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(`Network connection error: ${netErr.message || 'Please check your internet connection.'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const rawText = await res.text();
    if (rawText.includes('<!doctype') || rawText.includes('<html') || res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(`The optimization service is temporarily busy (status ${res.status}). Please retry in a moment.`);
    }
    throw new Error(rawText.slice(0, 150) || `Received non-JSON response from server (${res.status})`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (jsonErr: any) {
    throw new Error(`Invalid JSON received from server. Please retry.`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Server request failed (${res.status})`);
  }

  return data as T;
}
