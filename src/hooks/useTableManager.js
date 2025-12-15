import { useState, useMemo } from "react";

export const useTableManager = (
  data = [],
  searchKeys = [],
  initialRows = 8
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRows);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. FILTER LOGIC
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      // Check if ANY of the keys contains the search term
      return searchKeys.some((key) => {
        // Safe check: convert value to string and lowercase
        const value = item[key] ? String(item[key]).toLowerCase() : "";
        return value.includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKeys]);

  
  
  // 2. PAGINATION MATH
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  // Safety: If we search and results shrink, go back to page 1
  if (currentPage > totalPages) setCurrentPage(1);

  // Slice the data for the current view
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // 3. HANDLERS
  const changePage = (direction) => {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return {
    currentData, // The 10 items to display NOW
    searchTerm, // Value for input
    handleSearch, // Function for input onChange
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange, // Function for dropdown
    changePage, // Function for Next/Prev buttons
  };
};
