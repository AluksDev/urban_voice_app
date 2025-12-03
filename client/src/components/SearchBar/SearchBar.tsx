import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = () => {
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");

  const handleSearch = async () => {
    console.log(searchTitle);
    console.log(searchCategory);
    console.log(searchStatus);
    console.log(searchDate);
  };

  return (
    <div className="searchbar-container">
      <div>
        <input
          type="text"
          placeholder="Search Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </div>
      <div>
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        >
          <option value="" disabled>
            -- Search Category --
          </option>
          <option value="road">Road Damage</option>
          <option value="lighting">Street Lighting</option>
          <option value="hygiene">Cleanliness</option>
          <option value="furniture">Public Furniture</option>
          <option value="traffic-signs">Signs & Traffic Signals</option>
          <option value="parks">Parks & Green Spaces</option>
        </select>
      </div>
      <div>
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        >
          <option value="" disabled>
            -- Search Status --
          </option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>
      <div className="search-icon-container" onClick={handleSearch}>
        <img src="images/search-icon.svg" alt="" />
      </div>
    </div>
  );
};

export default SearchBar;
