import React, { useEffect, useState } from "react";
import "./MyReports.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import { capitalize } from "../../utils";

interface MyReportsProps {
  refreshReports: number;
}

const MyReports = ({ refreshReports }: MyReportsProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const apiUrl: string = import.meta.env.VITE_API_URL;

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
      <SearchBar />
      <div className="my-reports-container">
        {reports.length > 0 && (
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
                      {new Date(report.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyReports;
