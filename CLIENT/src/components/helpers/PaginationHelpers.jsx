export const paginateItems = (page, rowsPerPage, filteredItems) => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  return filteredItems.slice(start, end);
};

export const SortItems = (page, rowsPerPage, filteredItems, sortDescriptor) => {
  const sortedData = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column];
    const second = b[sortDescriptor.column];
    const cmp = first < second ? -1 : first > second ? 1 : 0;

    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  return sortedData.slice(start, end);
};
