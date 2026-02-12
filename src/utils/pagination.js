const PAGE_SIZE = 10;

// Normalizes room responses so the UI can always render one shape.
// Some APIs return a simple array, others return { count, next, previous, results }.
export const normalizeRoomsResponse = (rawData, requestedPage) => {
  if (Array.isArray(rawData)) {
    const totalPages = Math.max(1, Math.ceil(rawData.length / PAGE_SIZE));
    const boundedPage = Math.min(Math.max(requestedPage, 1), totalPages);
    const start = (boundedPage - 1) * PAGE_SIZE;
    const rooms = rawData.slice(start, start + PAGE_SIZE);

    return {
      rooms,
      currentPage: boundedPage,
      totalPages,
      hasNext: boundedPage < totalPages,
      hasPrevious: boundedPage > 1,
      mode: 'client',
    };
  }

  const rooms = rawData.results ?? [];
  const count = rawData.count ?? rooms.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return {
    rooms,
    currentPage: requestedPage,
    totalPages,
    hasNext: Boolean(rawData.next),
    hasPrevious: Boolean(rawData.previous),
    mode: 'server',
  };
};
