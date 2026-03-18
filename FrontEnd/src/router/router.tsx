import { createBrowserRouter } from 'react-router-dom';
import Login from '../page/Login';
import Activities from '../page/Activities';
import SingleActivity from '../page/Activity';
import ActivityEditor from '../page/ActivityEditor';
import ActivityResponder from '../page/ActivityResponder';
import ActivityEvaluator from '../page/ActivityEvaluator';

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
  },
  {
    path: '/atividade/:id/responder',
    element: <ActivityResponder />,
  },
  {
    path: '/atividade/:id/avaliar',
    element: <ActivityEvaluator />,
  },
]);

export default router;