import React, { useState, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Tile,
  Button,
  TextInput,
  OverflowMenu,
  OverflowMenuItem,
  Modal,
} from "@carbon/react";
import {
  Edit,
  TrashCan,
  OverflowMenuHorizontal,
  ChevronLeft,
  ChevronRight,
} from "@carbon/icons-react";
import Card from "./Card";

const Column = ({
  column,
  addTask,
  updateColumnTitle,
  deleteColumn,
  moveColumnLeft,
  moveColumnRight,
  canMoveLeft,
  canMoveRight,
  updateTask,
  deleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const CLIENT_ID = "3d54c01d2ee3455caf43fad4b846dcf6";
  const CLIENT_SECRECT = "873c7e341f534ee68e9d86a6c1cd46d0";
  useEffect(
    // API access token
    () => {
      var authParameters = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:
          "grant_type=client_credentials&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRECT,
      };

      fetch("https://accounts.spotify.com/api/token", authParameters)
        .then((result) => result.json())
        .then((data) => {
          setAccessToken(data.access_token);
        });
    },
    []
  );

  const handleSaveTitle = () => {
    if (editTitle.trim() !== "") {
      updateColumnTitle(column.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDeleteConfirm = () => {
    deleteColumn(column.id);
    setShowDeleteModal(false);
  };

  const handleTaskDeleteRequest = (task) => {
    setTaskToDelete(task);
    setShowDeleteTaskModal(true);
  };

  const handleTaskDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
    setShowDeleteTaskModal(false);
  };

  return (
    <>
      <Tile style={{ padding: "1rem", minHeight: "300px" }}>
        {/* Header con título editable y menú de opciones */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          {isEditing ? (
            <div style={{ flex: 1, marginRight: "0.5rem" }}>
              <TextInput
                id={`edit-title-${column.id}`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveTitle}
                autoFocus
                size="sm"
              />
            </div>
          ) : (
            <h3
              style={{
                margin: 0,
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}

          <OverflowMenu renderIcon={OverflowMenuHorizontal} size="sm" flipped>
            <OverflowMenuItem
              itemText="Mover a la izquierda"
              onClick={() => moveColumnLeft(column.id)}
              disabled={!canMoveLeft}
            />
            <OverflowMenuItem
              itemText="Mover a la derecha"
              onClick={() => moveColumnRight(column.id)}
              disabled={!canMoveRight}
            />
            <OverflowMenuItem
              itemText="Editar nombre"
              onClick={() => setIsEditing(true)}
            />
            <OverflowMenuItem
              itemText="Eliminar columna"
              isDelete
              onClick={() => setShowDeleteModal(true)}
            />
          </OverflowMenu>
        </div>

        {/* Área de drop para las tareas */}
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
                // minHeight: "200px",
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
                      <Card
                        task={task}
                        updateTask={updateTask}
                        onDeleteRequest={handleTaskDeleteRequest}
                        spotifyToken={accessToken}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Botón para añadir tarea */}
        <Button
          kind="ghost"
          size="sm"
          style={{ marginTop: "1rem" }}
          onClick={() => addTask(column.id)}
        >
          + Añadir Tarea
        </Button>
      </Tile>

      {/* Modal de confirmación para eliminar */}
      <Modal
        open={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onRequestSubmit={handleDeleteConfirm}
        modalHeading="Eliminar columna"
        modalLabel="Confirmación"
        primaryButtonText="Eliminar"
        secondaryButtonText="Cancelar"
        danger
      >
        <p>
          ¿Estás seguro de que quieres eliminar la columna "{column.title}"?
        </p>
        {column.tasks.length > 0 && (
          <p
            style={{
              color: "#da1e28",
              fontWeight: "500",
              wordBreak: "break-all",
              overflowWrap: "break-word",
            }}
          >
            ⚠️ Esta columna contiene {column.tasks.length} tarea
            {column.tasks.length !== 1 ? "s" : ""}. Al eliminarla, también se
            eliminarán todas las tareas.
          </p>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar tarea */}
      <Modal
        open={showDeleteTaskModal}
        onRequestClose={() => {
          setShowDeleteTaskModal(false);
          setTaskToDelete(null);
        }}
        onRequestSubmit={handleTaskDeleteConfirm}
        modalHeading="Eliminar tarea"
        modalLabel="Confirmación"
        primaryButtonText="Eliminar"
        secondaryButtonText="Cancelar"
        danger
        size="sm"
      >
        <p>¿Estás seguro de que quieres eliminar esta tarea?</p>
        {taskToDelete && (
          <div
            style={{
              background: "#363636",
              padding: "0.5rem",
              borderRadius: "4px",
              marginTop: "1rem",
              fontStyle: "italic",
            }}
          >
            "{taskToDelete.text}"
          </div>
        )}
      </Modal>
    </>
  );
};

export default Column;
