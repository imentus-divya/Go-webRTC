import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const createRoom = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        try {
            const resp = await fetch("http://localhost:8000/create");

            if (!resp.ok) {
                throw new Error(`HTTP error! status: ${resp.status}`);
            }

            const { room_id } = await resp.json();
            console.log("Room created with ID:", room_id);
            navigate(`/room/${room_id}`);
        } catch (err) {
            console.error("Error creating room:", err);
            setError("Failed to create room. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="create-room-container">
            <h1>Create a New Room</h1>
            <button
                onClick={createRoom}
                disabled={isCreating}
                className="create-room-button"
            >
                {isCreating ? "Creating..." : "Create Room"}
            </button>

            {error && <p className="error-message">{error}</p>}

            {/* You may move this CSS to an external file if preferred */}
            <style jsx="true">{`
                .create-room-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    gap: 20px;
                }

                .create-room-button {
                    padding: 12px 24px;
                    font-size: 16px;
                    background-color: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                .create-room-button:hover {
                    background-color: #45a049;
                }

                .create-room-button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }

                .error-message {
                    color: #ff3333;
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
};

export default CreateRoom;
