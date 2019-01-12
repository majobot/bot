export type Credentials = {
  username: string, password: string
};

export type MajobotOptions = {
  platforms?: {
    [name: string]: {
      credentials: Credentials,
      host?: string,
      port?: number
    }
  }
};