import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ClienteList from '../pages/clientes/ClienteList'
import ClienteForm from '../pages/clientes/ClienteForm'
import CategoriaList from '../pages/categorias/CategoriaList'
import CategoriaForm from '../pages/categorias/CategoriaForm'
import ServicoList from '../pages/servicos/ServicoList'
import ServicoForm from '../pages/servicos/ServicoForm'
import OrdemList from '../pages/ordens/OrdemList'
import OrdemForm from '../pages/ordens/OrdemForm'
import OrcamentoList from '../pages/orcamentos/OrcamentoList'
import OrcamentoForm from '../pages/orcamentos/OrcamentoForm'
import ContaPage from '../pages/conta/ContaPage'
import UsuarioList from '../pages/usuarios/UsuarioList'
import UsuarioForm from '../pages/usuarios/UsuarioForm'
import ProtectedRoute from '../components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClienteList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes/novo"
        element={
          <ProtectedRoute>
            <ClienteForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes/editar/:id"
        element={
          <ProtectedRoute>
            <ClienteForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <CategoriaList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categorias/novo"
        element={
          <ProtectedRoute>
            <CategoriaForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categorias/editar/:id"
        element={
          <ProtectedRoute>
            <CategoriaForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicos"
        element={
          <ProtectedRoute>
            <ServicoList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicos/novo"
        element={
          <ProtectedRoute>
            <ServicoForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicos/editar/:id"
        element={
          <ProtectedRoute>
            <ServicoForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ordens"
        element={
          <ProtectedRoute>
            <OrdemList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ordens/novo"
        element={
          <ProtectedRoute>
            <OrdemForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ordens/editar/:id"
        element={
          <ProtectedRoute>
            <OrdemForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orcamentos"
        element={
          <ProtectedRoute>
            <OrcamentoList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orcamentos/novo"
        element={
          <ProtectedRoute>
            <OrcamentoForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orcamentos/editar/:id"
        element={
          <ProtectedRoute>
            <OrcamentoForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute allowedProfiles={['ADMIN']}>
            <UsuarioList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/novo"
        element={
          <ProtectedRoute allowedProfiles={['ADMIN']}>
            <UsuarioForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/editar/:id"
        element={
          <ProtectedRoute allowedProfiles={['ADMIN']}>
            <UsuarioForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conta"
        element={
          <ProtectedRoute>
            <ContaPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
