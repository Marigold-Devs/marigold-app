import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  Branches,
  CreateDelivery,
  CreatePreorder,
  Dashboard,
  Deliveries,
  Login,
  Main,
  ModifyProduct,
  Notifications,
  Preorders,
  Products,
  Reports,
  ViewDelivery,
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

        <Route element={<Deliveries />} path="deliveries" />
        <Route element={<ViewDelivery />} path="deliveries/:deliveryId" />
        <Route element={<CreateDelivery />} path="deliveries/create" />

        <Route element={<Reports />} path="reports" />

        <Route element={<Notifications />} path="notifications" />
      </Route>
      <Route element={<Login />} path="login" />
    </Routes>
  </BrowserRouter>
);

export default App;
