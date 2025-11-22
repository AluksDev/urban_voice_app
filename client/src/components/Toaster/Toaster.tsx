import React from "react";
import "./Toaster.css";
type ToasterProps = {
  message: string;
  type: string;
  isLeaving: boolean;
};

const Toaster = ({ message, type, isLeaving }: ToasterProps) => {
  let iconUrl = type === "success" ? "check" : "error";
  let leavingClass = isLeaving ? "toaster-leave" : "";
  return (
    <div className={`toaster-container ${type} ${leavingClass}`}>
      <span>
        <img src={`images/${iconUrl}-icon.svg`} alt="" />
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toaster;
