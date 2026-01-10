import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { computeHeadingLevel } from "@testing-library/dom";
import api from "../API/api";


export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  
  useEffect(() => {
    api
      .get("/user/userDetails?searchVal=" + filter)
      .then((response) => {
        setUsers(response.data.user);
      });
  }, [filter]);

  return (
    <>
      <div className="font-bold pt-6 text-2xl">USERS</div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search users..."
          className=" border-2 border-slate-500 px-2 py-1 rounded w-full"
          onChange={(e) => {
            setFilter(e.target.value);
          }}
        ></input>
      </div>
      <div>
        {users.map((user) => (
          <User user={user} />
        ))}
      </div>
    </>
  );
};

function User({ user }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between">
      <div className="flex ">
        <div className="h-[40px] w-[40px] border-2 border-black bg-white rounded-full flex justify-center mr-4 mt-4">
          <div className="flex flex-col justify-center text-2xl h-full">
            {user.firstName[0]}
          </div>
        </div>
        <div className="flex flex-col justify-center text-xl ">
          {user.firstName} {user.lastName}
        </div>
      </div>
      <div className="flex flex-col h-full justify-center">
        <Button
          label={"Send Money"}
                  onClick={(e) => {
            navigate(
              "/send?id=" + user._id + "&firstname=" + user.firstName +"&lastname=" +user.lastName
            );
          }}
        />
      </div>
    </div>
  );
}
