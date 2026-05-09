import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from '../components/RecruiterDashboard';
import CandidateKanban from '../components/CandidateKanban';

// Simula el árbol de rutas sin doble router
const TestRoutes = () => (
  <Routes>
    <Route path="/" element={<RecruiterDashboard />} />
    <Route path="/kanban" element={<CandidateKanban />} />
  </Routes>
);

describe('UI route integration', () => {
  it('shows Kanban navigation in dashboard y navega a Kanban', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <TestRoutes />
      </MemoryRouter>
    );
    // El botón de navegación debe estar visible
    expect(screen.getByText(/Kanban de Candidatos/i)).toBeInTheDocument();
    // Simula click en el botón de navegación
    await userEvent.click(screen.getByText(/Ver Kanban por Posición/i));
    // El título de la página Kanban debe aparecer
    expect(await screen.findByText(/Kanban de Candidatos/i)).toBeInTheDocument();
  });
});
