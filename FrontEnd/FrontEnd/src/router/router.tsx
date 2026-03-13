import { createBrowserRouter } from 'react-router-dom';
import Login from '../page/Login';
import Activities from '../page/Activities';
import SingleActivity from '../page/Activity';
import ActivityEditor from '../page/ActivityEditor';

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
    path: '/atividade/consulta/:id',
    element: <SingleActivity />,
  },
  {
    path: '/atividade/novo', // <-- Rota para criar do zero
    element: <ActivityEditor />,
  },
  {
    path: '/atividade/editar/:id', // <-- Rota para editar questões de algo existente
    element: <ActivityEditor />,
  }
]);

export default router;