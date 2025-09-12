import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Tile, Button } from "@carbon/react";
import Card from "./Card";

const Column = ({ column, addTask }) => {
  return (
    <Tile style={{ padding: "1rem", minHeight: "300px" }}>
      <h3 style={{ marginBottom: "1rem" }}>{column.title}</h3>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              minWidth: "200px",
            }}
          >
            {column.tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Button
        kind="ghost"
        size="sm"
        style={{ marginTop: "1rem" }}
        onClick={() => addTask(column.id)}
      >
        + Añadir Tarea
      </Button>
    </Tile>
  );
};

export default Column;
