export const guardMiddleware =
  (...role) =>
  (req, res, next) => {
    const { user } = req
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
      })
      return
    }
    if (!role.includes(user.role)) {
      res.status(403).json({
        error: 'Forbidden',
      })
      return
    }
    next()
  }
