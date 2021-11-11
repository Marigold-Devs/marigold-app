import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login, Main, Branches, Dashboard, Products } from 'screens';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Main />} path="/">
        <Route index element={<Dashboard />} path="/dashboard" />
        <Route element={<Products />} path="products" />
        <Route element={<Branches />} path="branches" />
      </Route>
      <Route element={<Login />} path="login" />
    </Routes>
  </BrowserRouter>
);

export default App;
