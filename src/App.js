import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  Branches,
  CreatePreorder,
  Dashboard,
  Login,
  Main,
  ModifyProduct,
  Notifications,
  Preorders,
  Products,
  ViewPreorder,
} from 'screens';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Main />} path="/">
        <Route element={<Dashboard />} path="dashboard" />

        <Route element={<Branches />} path="branches" />

        <Route element={<Products />} path="products" />
        <Route element={<ModifyProduct />} path="products/create" />
        <Route element={<ModifyProduct />} path="products/:productId" />

        <Route element={<Preorders />} path="preorders" />
        <Route element={<ViewPreorder />} path="preorders/:preorderId" />
        <Route element={<CreatePreorder />} path="preorders/create" />

        <Route element={<Notifications />} path="notifications" />
      </Route>
      <Route element={<Login />} path="login" />
    </Routes>
  </BrowserRouter>
);

export default App;
