import { useEffect, useState } from "react";
import "./MyReports.css";
import { capitalize } from "../../utils";
import ReportDetails from "../../components/ReportDetails/ReportDetails";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../../api";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

interface MyReportsProps {
  refresh: number;
  onReportDelete: (message: string) => void;
}

const MyReports = ({ refresh, onReportDelete }: MyReportsProps) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [showReportDetails, setShowReportDetails] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const { id } = useParams<{ id?: string }>();

  const isMobile = width < 768;

  async function fetchReports() {
    try {
      setLoadingReports(true);
      const data = await apiRequest(`reports/user`, {
        method: "GET",
        credentials: "include",
      });
      setReports(data.reports || []);
    } catch (e) {
      console.error("Error in fetching reports", e);
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleSearch(sortField?: string) {
    const trimmedTitle = searchTitle.trim().toLowerCase();
    try {
      const query = new URLSearchParams({
        title: trimmedTitle,
        category: searchCategory,
        status: searchStatus,
        date: searchDate,
      });
      if (sortField) query.append("sort", sortField);
      const data = await apiRequest(`reports/search?${query.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      setReports(data.reports);
    } catch (e) {
      console.error(e);
    }
  }

  function openSortList() {
    document.getElementById("sortList")?.classList.toggle("show");
    document.getElementById("sortContainer")?.classList.toggle("active");
  }

  function handleSortClick(field: string) {
    handleSearch(field);
  }

  async function handleDeleteReport(reportId: number) {
    try {
      const data = await apiRequest(`reports/delete/${reportId}`, {
        credentials: "include",
        method: "DELETE",
      });
      onReportDelete(t(`myReports.messages.${data.code}`)); // REPORT_DELETED
      fetchReports();
    } catch (e) {
      console.error("Error deleting report", e);
    }
  }

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [refresh]);
  useEffect(() => {
    if (id && reports.length > 0) {
      const foundReport = reports.find((report) => report.id === Number(id));
      if (foundReport) {
        setSelectedReport(foundReport);
        setShowReportDetails(true);
      }
    }
  }, [id, reports]);
  return (
    <>
      {showReportDetails && (
        <ReportDetails
          closeDetailsWindow={() => setShowReportDetails(false)}
          report={selectedReport}
          isAdmin={false}
        />
      )}
      {loadingReports ? (
        <LoadingSpinner />
      ) : (
        <div>
          <div className="searchbar-container">
            <div>
              <input
                type="text"
                placeholder={t("myReports.search.titlePlaceholder")}
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
                  {t("myReports.search.categoryPlaceholder")}
                </option>
                <option value="road">
                  {t("myReports.search.categories.road")}
                </option>
                <option value="lighting">
                  {t("myReports.search.categories.lighting")}
                </option>
                <option value="hygiene">
                  {t("myReports.search.categories.hygiene")}
                </option>
                <option value="furniture">
                  {t("myReports.search.categories.furniture")}
                </option>
                <option value="traffic-signs">
                  {t("myReports.search.categories.traffic-signs")}
                </option>
                <option value="parks">
                  {t("myReports.search.categories.parks")}
                </option>
              </select>
            </div>
            <div>
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="" disabled>
                  {t("myReports.search.statusPlaceholder")}
                </option>
                <option value="pending">
                  {t("myReports.search.statuses.pending")}
                </option>
                <option value="approved">
                  {t("myReports.search.statuses.approved")}
                </option>
                <option value="closed">
                  {t("myReports.search.statuses.closed")}
                </option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div
              className="search-icon-container"
              onClick={() => handleSearch()}
            >
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
                  <p>{t("myReports.sortBy")}</p>
                  <div className="sort-list-container" id="sortList">
                    <p onClick={() => handleSortClick("title")}>
                      {t("myReports.tableHeaders.title")}
                    </p>
                    <p onClick={() => handleSortClick("category")}>
                      {t("myReports.tableHeaders.category")}
                    </p>
                    <p onClick={() => handleSortClick("status")}>
                      {t("myReports.tableHeaders.status")}
                    </p>
                    <p onClick={() => handleSortClick("created_at")}>
                      {t("myReports.tableHeaders.dateSubmitted")}
                    </p>
                  </div>
                </div>
                {isMobile ? (
                  reports.map((report) => (
                    <div key={report.id} className="my-report-mobile-card">
                      <div className="my-report-mobile-card-details">
                        <p>{capitalize(report.title)}</p>
                        <p>
                          {t(`myReports.search.categories.${report.category}`)}
                        </p>
                        <p>
                          {t("myReports.tableHeaders.status")}:{" "}
                          {t(`myReports.search.statuses.${report.status}`)}
                        </p>
                        <p>
                          {t("myReports.tableHeaders.dateSubmitted")}:{" "}
                          {new Date(report.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </div>
                      <div className="my-reports-mobile-actions-container">
                        <span
                          onClick={() => {
                            setShowReportDetails(true);
                            setSelectedReport(report);
                          }}
                        >
                          <img src="images/modify-icon.png" alt="" />
                        </span>
                        <span onClick={() => handleDeleteReport(report.id)}>
                          <img src="images/delete-icon.png" alt="" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>{t("myReports.tableHeaders.title")}</th>
                        <th>{t("myReports.tableHeaders.category")}</th>
                        <th>{t("myReports.tableHeaders.status")}</th>
                        <th>{t("myReports.tableHeaders.dateSubmitted")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>{capitalize(report.title)}</td>
                          <td>
                            {t(
                              `myReports.search.categories.${report.category}`,
                            )}
                          </td>
                          <td>
                            {t(`myReports.search.statuses.${report.status}`)}
                          </td>
                          <td>
                            {new Date(report.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="myreports-actions-container">
                            <span
                              onClick={() => {
                                setShowReportDetails(true);
                                setSelectedReport(report);
                              }}
                            >
                              <img src="images/modify-icon.png" alt="" />
                            </span>
                            <span onClick={() => handleDeleteReport(report.id)}>
                              <img src="images/delete-icon.png" alt="" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <div className="no-reports-container">
                <p>{t("myReports.noReports")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyReports;
