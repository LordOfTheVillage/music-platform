export const setRefreshTokenCookie = (res, refreshToken) => {
  const name = 'refreshToken';
  res.cookie(name, refreshToken, {
    httpOnly: true,
  });
};
