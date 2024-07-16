export const filterItems = (data, filterValue, statusFilter, statusOptions) => {
  return data.filter((user) => {
    const matchesSearch =
      !filterValue ||
      user.Username.toLowerCase().includes(filterValue.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      Array.from(statusFilter).includes(
        user.isDeactivated === 0 ? "active" : "disabled"
      );
    return matchesSearch && matchesStatus;
  });
};
