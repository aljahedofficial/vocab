import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../components/Navbar';

// Mocking Supabase and auth logic if necessary
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
    },
}));

describe('Navbar Component', () => {
    it('renders logo and navigation links', () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/VocabDash/i)).toBeInTheDocument();
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
});
