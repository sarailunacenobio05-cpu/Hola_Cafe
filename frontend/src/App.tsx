import React from 'react';
import { useApp } from './context/AppContext';
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

// Modals
import { CobroRapidoModal } from './components/modals/CobroRapidoModal';
import { TicketModal } from './components/modals/TicketModal';
import { ProductoModal } from './components/modals/ProductoModal';
import { UsuarioModal } from './components/modals/UsuarioModal';
import { BotonModal } from './components/modals/BotonModal';
import { ConfirmarBajaModal } from './components/modals/ConfirmarBajaModal';
import { ConfirmarEliminarModal } from './components/modals/ConfirmarEliminarModal';

export const App: React.FC = () => {
  const { activeView } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'login':
        return <LoginView />;
      case 'recuperar-password':
        return <RecuperarPasswordView />;
      case 'registro':
        return <RegistroView />;
      case 'mapa-mesas':
        return <MapaMesasView />;
      case 'comandero':
        return <ComanderoView />;
      case 'cocina':
        return <CocinaKDSView />;
      case 'caja':
        return <CajaView />;
      case 'config-menu':
        return <ConfiguracionMenuView />;
      case 'config-usuarios':
        return <ConfiguracionUsuariosView />;
      case 'botones-aviso':
        return <BotonesAvisoView />;
      default:
        return <MapaMesasView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1810]">
      {renderCurrentView()}

      {/* Global Application Modals */}
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
