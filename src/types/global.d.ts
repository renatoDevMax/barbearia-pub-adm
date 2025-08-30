declare global {
  var mongoose: {
    conn: unknown;
    promise: Promise<unknown>;
  };
}

export {};
