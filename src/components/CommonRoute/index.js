import React from 'react';
import { Route } from 'react-router-dom';

const CommonRoute = (props) => <Route {...props} />;

export default CommonRoute;
//   const { user } = useAuth();

//   // Redirect to main page
//   if (user) {
//     return <Route render={() => <Redirect to="/" />} />;
//   } else {
//     return <Route render={() => <Redirect to="/login" />} />;
//   }
