import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React from "react";

export const filesQuery = gql`
  query {
    datafiles {
      id
      description
    }
  }
`;

export const Files = () => {
  const { data, loading } = useQuery(filesQuery);
  
  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      {
        data.datafiles.map(({id, desc}) => (
          <img
            style={{ width: 200 }}
            key={id}
            src={`http://192.168.1.16:4000/images/${id}.jpg`}
            alt={id}
          />
        ))
      }
    </div>
  );
};
