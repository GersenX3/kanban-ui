import React, { useState } from "react";
import { Tile, TextArea, Button } from "@carbon/react";
import { Edit, TrashCan, Music } from "@carbon/icons-react";

const Card = ({ task, updateTask, onDeleteRequest }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const handleSaveTask = () => {
    const newText = editText.trim();
    if (newText !== "") {
      const updates = { text: newText };

      if (newText !== task.text) {
        // Si cambió el texto, limpiamos la recomendación
        updates.musicRecommendation = null;
      }

      updateTask(task.id, updates);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveTask();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleGetMusicRecommendation = async () => {
    setLoadingMusic(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(task.text)}&media=music&limit=1`
      );

      if (!response.ok) throw new Error("iTunes API error");

      const data = await response.json();

      if (data.resultCount > 0) {
        const track = data.results[0];
        updateTask(task.id, {
          musicRecommendation: {
            name: track.trackName,
            artist: track.artistName,
            albumImage: track.artworkUrl100,
            spotifyUrl: track.trackViewUrl,
          },
        });
      } else {
        updateTask(task.id, {
          musicRecommendation: { error: "No recommendation" },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      updateTask(task.id, {
        musicRecommendation: { error: "Error" },
      });
    } finally {
      setLoadingMusic(false);
    }
  };

  return (
    <>
      <Tile
        style={{
          padding: "0.75rem",
          backgroundColor: "#363636",
          position: "relative",
          cursor: isEditing ? "text" : "default",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
        >
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <TextArea
                id={`edit-task-${task.id}`}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveTask}
                autoFocus
                rows={2}
                style={{
                  resize: "none",
                  minHeight: "auto",
                }}
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                style={{
                  cursor: "pointer",
                  minHeight: "1.5rem",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.text}
              </div>
            )}
          </div>

          {!isEditing && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                flexShrink: 0,
                alignItems: "center",
              }}
            >
              {task.musicRecommendation && !task.musicRecommendation.error ? (
                <a
                  href={task.musicRecommendation.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", width: "2rem", height: "2rem" }}
                >
                  <img
                    src={task.musicRecommendation.albumImage}
                    alt={`${task.musicRecommendation.name} cover`}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                </a>
              ) : (
                <Button
                  kind="secondary"
                  size="sm"
                  renderIcon={Music}
                  iconDescription="Get music recommendation"
                  hasIconOnly
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetMusicRecommendation();
                  }}
                  disabled={loadingMusic}
                  style={{ minHeight: "2rem", width: "2rem" }}
                />
              )}

              <Button
                kind="ghost"
                size="sm"
                renderIcon={Edit}
                iconDescription="Edit task"
                hasIconOnly
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                style={{
                  minHeight: "2rem",
                  width: "2rem",
                }}
              />
              <Button
                kind="danger--ghost"
                size="sm"
                renderIcon={TrashCan}
                iconDescription="Delete task"
                hasIconOnly
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(task);
                }}
                style={{
                  minHeight: "2rem",
                  width: "2rem",
                }}
              />
            </div>
          )}
        </div>

        {isEditing && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginTop: "0.5rem",
              alignItems: "stretch",
            }}
          >
            <Button
              kind="primary"
              size="sm"
              onClick={handleSaveTask}
              style={{ width: "100%" }}
            >
              Save
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={handleCancelEdit}
              style={{ width: "100%" }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Tile>
    </>
  );
};

export default Card;
