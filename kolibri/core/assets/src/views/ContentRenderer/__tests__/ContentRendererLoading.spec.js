import { render, screen } from '@testing-library/vue';
import VueRouter from 'vue-router';
import ContentRendererLoading from '../ContentRendererLoading.vue';

describe('ContentRendererLoading', () => {
  test('the component should render correctly', () => {
    render(ContentRendererLoading, {
      routes: new VueRouter(),
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
