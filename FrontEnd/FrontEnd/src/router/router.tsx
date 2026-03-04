import { createBrowserRouter } from 'react-router-dom';
import Login from '../page/Login';
import Activity from '../page/Activity';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/atividades',
    element: <Activity />,
  }
]);

export default router;