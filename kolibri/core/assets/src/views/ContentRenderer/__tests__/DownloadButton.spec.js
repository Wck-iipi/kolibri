import Vue from 'vue';
import { render, screen } from '@testing-library/vue';
import VueRouter from 'vue-router';
import useUser, { useUserMock } from 'kolibri.coreVue.composables.useUser';
import DownloadButton from '../DownloadButton.vue';
import { RENDERER_SUFFIX } from '../constants';

jest.mock('kolibri.coreVue.composables.useUser');

const getDownloadableFile = (isExercise = false) => {
  const PRESET = isExercise ? 'exercise' : 'thumbnail';

  // Register a component with the preset name so that the file is considered renderable
  Vue.component(PRESET + RENDERER_SUFFIX, { template: '<div></div>' });

  return {
    preset: PRESET,
    available: true,
    file_size: 100,
    storage_url: 'http://example.com/sample.png',
    extension: 'png',
    checksum: '1234567890',
  };
};

// A helper function to render the component with the given props and some default mocks
const renderComponent = props => {
  const { useUserMock: useUserMockProps, ...componentProps } = props;

  useUser.mockImplementation(() =>
    useUserMock({
      isAppContext: false,
      ...useUserMockProps,
    })
  );

  return render(DownloadButton, {
    routes: new VueRouter(),
    props: {
      files: [],
      nodeTitle: '',
      ...componentProps,
    },
  });
};

const SAVE_BUTTON_TEXT = 'Save to device';

describe('DownloadButton', () => {
  beforeEach(() => {
    Vue.options.components = {};
  });

  test('does not render if isAppContext is true', () => {
    renderComponent({
      useUserMock: {
        isAppContext: true,
      },
    });

    expect(screen.queryByText(SAVE_BUTTON_TEXT)).not.toBeInTheDocument();
  });

  test('should not render if there are no downloadable files even if isAppContext is false', () => {
    renderComponent({
      files: [],
      useUserMock: {
        isAppContext: false,
      },
    });

    expect(screen.queryByText(SAVE_BUTTON_TEXT)).not.toBeInTheDocument();
  });

  test('should not render if isAppContext is false and there are only renderable exercise files', () => {
    renderComponent({
      files: [getDownloadableFile(true)],
      useUserMock: {
        isAppContext: false,
      },
    });

    expect(screen.queryByText(SAVE_BUTTON_TEXT)).not.toBeInTheDocument();
  });

  test('should render if isAppContext is false and there are renderable document files', async () => {
    renderComponent({
      files: [getDownloadableFile()],
      useUserMock: {
        isAppContext: false,
      },
    });

    expect(screen.getByText(SAVE_BUTTON_TEXT)).toBeInTheDocument();
  });
});
