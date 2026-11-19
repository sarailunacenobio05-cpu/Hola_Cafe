import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from './views/LoginView';
import { RecuperarPasswordView } from './views/RecuperarPasswordView';
import { RegistroView } from './views/RegistroView';
import { MapaMesasView } from './views/MapaMesasView';
import { ComanderoView } from './views/ComanderoView';
import { CocinaKDSView } from './views/CocinaKDSView';
import { CajaView } from './views/CajaView';
import { ConfiguracionMenuView } from './views/ConfiguracionMenuView';
import { ConfiguracionUsuariosView } from './views/ConfiguracionUsuariosView';
import { BotonesAvisoView } from './views/BotonesAvisoView';
import { ProtegerRuta } from './routes/ProtegerRuta';

import { CobroRapidoModal } from './components/modals/CobroRapidoModal';
import { TicketModal } from './components/modals/TicketModal';
import { ProductoModal } from './components/modals/ProductoModal';
import { UsuarioModal } from './components/modals/UsuarioModal';
import { BotonModal } from './components/modals/BotonModal';
import { ConfirmarBajaModal } from './components/modals/ConfirmarBajaModal';
import { ConfirmarEliminarModal } from './components/modals/ConfirmarEliminarModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1810]">
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordView />} />
        <Route path="/registro" element={<RegistroView />} />

        <Route
          path="/mesas"
          element={
            <ProtegerRuta rolesPermitidos={['Mesero', 'Administrador']}>
              <MapaMesasView />
            </ProtegerRuta>
          }
        />
        <Route
          path="/comandero"
          element={
            <ProtegerRuta rolesPermitidos={['Mesero', 'Administrador']}>
              <ComanderoView />
            </ProtegerRuta>
          }
        />
        <Route
          path="/cocina"
          element={
            <ProtegerRuta rolesPermitidos={['Cocinero', 'Administrador']}>
              <CocinaKDSView />
            </ProtegerRuta>
          }
        />

        <Route
          path="/admin/caja"
          element={
            <ProtegerRuta rolesPermitidos={['Administrador']}>
              <CajaView />
            </ProtegerRuta>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtegerRuta rolesPermitidos={['Administrador']}>
              <ConfiguracionMenuView />
            </ProtegerRuta>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtegerRuta rolesPermitidos={['Administrador']}>
              <ConfiguracionUsuariosView />
            </ProtegerRuta>
          }
        />
        <Route
          path="/admin/botones"
          element={
            <ProtegerRuta rolesPermitidos={['Administrador']}>
              <BotonesAvisoView />
            </ProtegerRuta>
          }
        />

        <Route path="*" element={<Navigate to="/mesas" replace />} />
      </Routes>

      <CobroRapidoModal />
      <TicketModal />
      <ProductoModal />
      <UsuarioModal />
      <BotonModal />
      <ConfirmarBajaModal />
      <ConfirmarEliminarModal />
    </div>
  );
};

export default App;
