const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

/**
 * Decodes the JWT token and extracts the user ID.
 */
export const getUserIdFromToken = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload.id as string;
  } catch (error) {
    console.error('Error decoding token:', error);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    return null;
  }
};


/**
 * Fetches full user data from backend using user ID.
 */
export const fetchUserData = async (userId: string, token: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch user');

    return await res.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    localStorage.removeItem('token');
    return null;
  }
};
