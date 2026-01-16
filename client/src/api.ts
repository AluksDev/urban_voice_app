export const apiUrl =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:3001`;

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    const res = await fetch(`${apiUrl}/${endpoint}`, options);
    const body = await res.json();
    if (!body.success) {
      throw new Error(body.code);
    }
    return body;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
