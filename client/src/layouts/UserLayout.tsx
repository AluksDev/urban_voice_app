import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";
function UserLayout({ openNewReport, onOpenModal, openReportDetails }: any) {
  return (
    <>
      {" "}
      <Header
        openNewReport={openNewReport}
        onOpenModal={onOpenModal}
        openReportDetails={openReportDetails}
      />{" "}
      <Outlet />{" "}
    </>
  );
}
export default UserLayout;
