export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const getInitials = (name?: string, fallback = 'U') => {
  if (!name) return fallback;
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export const toFriendlyError = (error: unknown, defaultMessage: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (typeof response?.data === 'string') return response.data;
    if (typeof response?.data === 'object' && response.data !== null) {
      const message = Object.values(response.data as Record<string, unknown>).flat()[0];
      if (typeof message === 'string') return message;
    }
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
};
