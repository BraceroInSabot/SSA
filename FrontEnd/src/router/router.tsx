import { createBrowserRouter } from 'react-router-dom';
import Login from '../page/Login';
import Activities from '../page/Activities';
import SingleActivity from '../page/Activity';
import ActivityEditor from '../page/ActivityEditor';
import ActivityResponder from '../page/ActivityResponder';
import ActivityEvaluator from '../page/ActivityEvaluator';
import ProfilePage from '../page/Profile';
import Bimestres from '../page/Bimestres';

const router = createBrowserRouter([
  {
    path: '/',
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
    path: '/atividade/novo',
    element: <ActivityEditor />,
  },
  {
    path: '/atividade/editar/:id',
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
  {
    path: '/perfil',
    element: <ProfilePage />,
  },
  {
    path: '/bimestres',
    element: <Bimestres />,
  }
]);

export default router;
