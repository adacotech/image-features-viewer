import { Route, Routes, Navigate } from "react-router-dom"

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={}>
        <Route
          index
          element={<ProtectedRoute component={} }
        />
      </Route>
    </Routes>
  )
}