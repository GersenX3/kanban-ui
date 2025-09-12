import React from "react";
import { Tile } from "@carbon/react";

const Card = ({ task }) => {
  return (
    <Tile style={{ padding: "0.75rem", backgroundColor: "#fff" }}>
      {task.text}
    </Tile>
  );
};

export default Card;
