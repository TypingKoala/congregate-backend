// game update data object definition
export interface IGameUpdateData {
  // send current player coordinates
  pos: {
    lat: number,
    lng: number
  }
}

export enum GameStatus {
  InLobby = "InLobby", // when waiting for other player
  Starting = "Starting", // game is starting in 3 seconds
  InProgress = "InProgress", // game in progress
  Win = "Win", // players found each other
  Loss = "Loss", // players ran out of time
}

export interface IPlayerData {
  username: string
}

// game status data object definition
export interface IGameStatusData {
  status: GameStatus
  timeRemaining: number // in seconds
  score: number // cumulative score after each game
  players: IPlayerData[]
}