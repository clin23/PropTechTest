import { render, screen } from '@testing-library/react';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import PageHeader from '../components/PageHeader';
import { describe, it, expect } from 'vitest';

describe('shared components', () => {
  it('renders error message', () => {
    render(<ErrorState message="Error!" />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('renders skeleton', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders page header', () => {
    render(<PageHeader title="Title" />);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });
});
