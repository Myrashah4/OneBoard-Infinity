from fastapi import FastAPI, WebSocket
from game_logic.chess_logic import ChessGame
from game_logic.ludo_logic import LudoGame

app = FastAPI()

# Initialize games
chess_game = ChessGame()
ludo_game = LudoGame()

@app.websocket("/ws/chess")
async def websocket_endpoint_chess(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        response = chess_game.process_move(data)
        await websocket.send_text(response)

@app.websocket("/ws/ludo")
async def websocket_endpoint_ludo(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        response = ludo_game.process_move(data)
        await websocket.send_text(response)
