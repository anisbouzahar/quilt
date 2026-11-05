declare const process: {
  env: {
    readonly EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};
