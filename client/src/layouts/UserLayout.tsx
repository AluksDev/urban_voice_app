import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";
function UserLayout({ openNewReport, onOpenModal }: any) {
  return (
    <>
      {" "}
      <Header openNewReport={openNewReport} onOpenModal={onOpenModal} />{" "}
      <Outlet />{" "}
    </>
  );
}
export default UserLayout;
