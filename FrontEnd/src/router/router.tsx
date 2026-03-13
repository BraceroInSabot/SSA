import { createBrowserRouter } from 'react-router-dom';
import Login from '../page/Login';
import Activities from '../page/Activities';
import SingleActivity from '../page/Activity';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/atividades',
    element: <Activities />,
  },
  {
    path: '/atividade/:id',
    element: <SingleActivity />,
  }
]);

export default router;