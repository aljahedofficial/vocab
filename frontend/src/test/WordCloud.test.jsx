import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WordCloudComponent from '../components/WordCloud';

// Mocking the react-d3-cloud library as it might be complex to render in JSDOM
vi.mock('react-d3-cloud', () => ({
    default: () => <div data-testid="word-cloud">Mocked Word Cloud</div>,
}));

describe('WordCloudComponent', () => {
    const mockData = [
        { word: 'hello', frequency: 10 },
        { word: 'world', frequency: 5 },
    ];

    it('renders the component title', () => {
        render(<WordCloudComponent data={mockData} />);
        expect(screen.getByText(/Vocabulary Cloud/i)).toBeInTheDocument();
    });

    it('renders the mocked word cloud', () => {
        render(<WordCloudComponent data={mockData} />);
        expect(screen.getByTestId('word-cloud')).toBeInTheDocument();
    });
});
