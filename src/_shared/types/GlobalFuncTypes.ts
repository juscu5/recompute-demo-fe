export interface CreateLog {
  createLogs: (module: string, activity: string, remarks: string) => void;
}

export interface Logout {
  logMeOut: () => void;
}
