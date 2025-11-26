import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  return (
    <div>
      <h2>User ID: {id}</h2>
      <h3>User Name: {auth.user?.name} </h3>
      <h3>User Surname: {auth.user?.surname} </h3>
      <h3>User Email: {auth.user?.email} </h3>
      <h3>User Role: {auth.user?.role} </h3>
      <h3>User Picture URL: {auth.user?.picture_url} </h3>
    </div>
  );
};

export default UserProfile;
