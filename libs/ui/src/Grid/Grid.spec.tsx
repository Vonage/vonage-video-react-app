import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Grid from './index';

describe('Grid', () => {
  it('renders correctly', () => {
    render(
      <Grid container data-testid="grid-container">
        <Grid item xs={6}>
          <div>Item 1</div>
        </Grid>
        <Grid item xs={6}>
          <div>Item 2</div>
        </Grid>
      </Grid>
    );

    const gridContainer = screen.getByTestId('grid-container');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('MuiGrid-container');

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders container with different spacing', () => {
    render(
      <Grid container spacing={2} data-testid="spaced-grid">
        <Grid item xs={4}>
          <div>Spaced Item 1</div>
        </Grid>
        <Grid item xs={4}>
          <div>Spaced Item 2</div>
        </Grid>
        <Grid item xs={4}>
          <div>Spaced Item 3</div>
        </Grid>
      </Grid>
    );

    const spacedGrid = screen.getByTestId('spaced-grid');
    expect(spacedGrid).toHaveClass('MuiGrid-spacing-xs-2');
  });

  it('renders items with different breakpoints', () => {
    render(
      <Grid container>
        <Grid item xs={12} sm={6} md={4} data-testid="responsive-item">
          <div>Responsive item</div>
        </Grid>
      </Grid>
    );

    const responsiveItem = screen.getByTestId('responsive-item');
    expect(responsiveItem).toHaveClass('MuiGrid-grid-xs-12');
    expect(responsiveItem).toHaveClass('MuiGrid-grid-sm-6');
    expect(responsiveItem).toHaveClass('MuiGrid-grid-md-4');
  });

  it('renders with wrap properties', () => {
    render(
      <Grid container wrap="nowrap" data-testid="nowrap-grid">
        <Grid item xs={6}>
          <div>No wrap item 1</div>
        </Grid>
        <Grid item xs={6}>
          <div>No wrap item 2</div>
        </Grid>
        <Grid item xs={6}>
          <div>No wrap item 3</div>
        </Grid>
      </Grid>
    );

    const nowrapGrid = screen.getByTestId('nowrap-grid');
    expect(nowrapGrid).toHaveClass('MuiGrid-wrap-xs-nowrap');
  });

  it('renders as different HTML elements', () => {
    render(
      <Grid container component="section" data-testid="section-grid">
        <Grid item component="article">
          <div>Article content</div>
        </Grid>
      </Grid>
    );

    const sectionGrid = screen.getByTestId('section-grid');
    expect(sectionGrid.tagName).toBe('SECTION');
  });

  it('renders nested grids', () => {
    render(
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <div data-testid="nested-item-1">Nested 1</div>
            </Grid>
            <Grid item xs={6}>
              <div data-testid="nested-item-2">Nested 2</div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <div>Main item</div>
        </Grid>
      </Grid>
    );

    expect(screen.getByTestId('nested-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('nested-item-2')).toBeInTheDocument();
    expect(screen.getByText('Main item')).toBeInTheDocument();
  });
});
