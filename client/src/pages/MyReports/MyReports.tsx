import React, { useEffect, useState } from "react";
import "./MyReports.css";
import { capitalize } from "../../utils";

interface MyReportsProps {
  refreshReports: number;
}

const MyReports = ({ refreshReports }: MyReportsProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");

  const apiUrl: string = import.meta.env.VITE_API_URL;

  const handleSearch = async (sortField?: string) => {
    const trimmedTitle = searchTitle.trim().toLowerCase();
    try {
      const query = new URLSearchParams({
        title: trimmedTitle,
        category: searchCategory,
        status: searchStatus,
        date: searchDate,
      });
      if (sortField) {
        query.append("sort", sortField);
      }
      const res = await fetch(`${apiUrl}/reports/search?${query.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error in response");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setReports(data.reports);
    } catch (e) {
      console.error(e);
    }
  };

  const openSortList = () => {
    document.getElementById("sortList")?.classList.toggle("show");
    document.getElementById("sortContainer")?.classList.toggle("active");
  };

  const handleSortClick = (field: string) => {
    handleSearch(field); // reuse search, just add sort
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${apiUrl}/reports/user`, {
          credentials: "include",
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Error in response");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        setReports(data.reports);
      } catch (e) {
        console.error("Error in fetching reports", e);
      }
    };
    fetchReports();
  }, [refreshReports]);
  return (
    <div>
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
        <div className="search-icon-container" onClick={() => handleSearch()}>
          <img src="images/search-icon.svg" alt="" />
        </div>
      </div>
      <div className="my-reports-container">
        {reports.length > 0 ? (
          <>
            <div
              className="sort-container"
              onClick={openSortList}
              id="sortContainer"
            >
              <p>Sort By</p>
              <div className="sort-list-container" id="sortList">
                <p onClick={() => handleSortClick("title")}>Title</p>
                <p onClick={() => handleSortClick("category")}>Category</p>
                <p onClick={() => handleSortClick("status")}>Status</p>
                <p onClick={() => handleSortClick("created_at")}>Date</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  return (
                    <tr key={report.id}>
                      <td>#{report.id}</td>
                      <td>{capitalize(report.title)}</td>
                      <td>{capitalize(report.category)}</td>
                      <td>{capitalize(report.status)}</td>
                      <td>
                        {new Date(report.created_at).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <div className="no-reports-container">
            <p>No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
