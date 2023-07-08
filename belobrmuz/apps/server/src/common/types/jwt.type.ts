export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
};

export type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};
